import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) throw new Error("Supabase configuration missing");

    // JWT Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { documentType, filePath } = await req.json();

    if (!documentType || !filePath) {
      return new Response(JSON.stringify({ error: "Missing documentType or filePath" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download the document from storage using service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: fileData, error: downloadError } = await adminClient.storage
      .from("documents")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      throw new Error("Failed to download document for scanning");
    }

    // Convert to base64 for vision API
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = filePath.endsWith(".pdf") ? "application/pdf" : 
                     filePath.endsWith(".png") ? "image/png" : "image/jpeg";

    // Build document-specific validation prompt
    const validationPrompts: Record<string, string> = {
      aadhaar_front: `Analyze this Aadhaar Card (front side) image. Extract and validate:
1. Full Name as printed
2. 12-digit Aadhaar Number (format: XXXX XXXX XXXX)
3. Date of Birth
4. Gender
5. Is this a valid government-issued Aadhaar card? Check for:
   - Official UIDAI logo/header
   - Photo presence
   - QR code presence
   - Proper formatting`,
      
      aadhaar_back: `Analyze this Aadhaar Card (back side) image. Extract and validate:
1. Address as printed
2. VID number if visible
3. QR code presence
4. Is this a valid back side of an Aadhaar card?`,
      
      pan_card: `Analyze this PAN Card image. Extract and validate:
1. Full Name
2. PAN Number (format: ABCDE1234F — 5 letters, 4 digits, 1 letter)
3. Date of Birth
4. Father's Name
5. Is this a valid government-issued PAN card? Check for:
   - Income Tax Department header
   - Govt of India marking
   - Photo presence
   - Hologram/embossed seal indication`,
      
      address_proof: `Analyze this Address Proof document. Extract and validate:
1. Full Name/Account Holder Name
2. Address
3. Document type (utility bill, bank statement, passport, voter ID)
4. Date of issue (must be within 3 months)
5. Is this a valid address proof document?`,
    };

    const prompt = validationPrompts[documentType] || "Analyze this document and extract key information.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a KYC document verification AI for FinWise, an Indian fintech platform. 
Your job is to extract information from government-issued identity documents and validate their authenticity.
Be precise with extracted data. Flag any concerns about document quality or potential fraud.
Return results as structured JSON with fields: extractedData, isValid, confidence (0-100), issues (array of strings), summary.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI OCR error:", response.status, errText);
      throw new Error("Document analysis failed");
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices?.[0]?.message?.content || "";

    // Try to parse structured output, fallback to raw text
    let ocrResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        ocrResult = JSON.parse(jsonMatch[0]);
      } else {
        ocrResult = {
          extractedData: {},
          isValid: true,
          confidence: 70,
          issues: [],
          summary: analysisText,
        };
      }
    } catch {
      ocrResult = {
        extractedData: {},
        isValid: true,
        confidence: 70,
        issues: [],
        summary: analysisText,
      };
    }

    console.log(`OCR scan complete for ${documentType}, user: ${user.id}, confidence: ${ocrResult.confidence}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentType,
        ocrResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Document OCR error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
