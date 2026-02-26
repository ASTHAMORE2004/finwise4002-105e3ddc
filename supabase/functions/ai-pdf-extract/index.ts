import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { fileBase64, mimeType, targetForm } = await req.json();
    if (!fileBase64) throw new Error("No file data provided");

    const fieldPrompts: Record<string, string> = {
      startup: `Extract these fields from the document for a Startup Registration form:
- startup_name (company/business name)
- description (business description if found)
- sector (industry/sector)
- funding_goal (any funding amount mentioned)
- website_url (website if found)
- founded_year (year of incorporation/founding)
- team_size (number of team members/directors)
- full_name (founder/director name)
- pan_number (PAN number if visible)
- aadhaar_number (Aadhaar number if visible)
- address (registered address)
- gst_number (GST number if found)
- cin_number (CIN/incorporation number if found)

Return ONLY a JSON object with these field names as keys. Use null for fields not found.`,
      ipo: `Extract these fields from the document for an IPO Registration form:
- company_name (company legal name)
- symbol (stock symbol if mentioned)
- description (company description)
- sector (industry/sector)
- issue_size (total issue size if mentioned)
- full_name (promoter/director name)
- pan_number (PAN number if visible)
- address (registered office address)
- gst_number (GST number if found)
- cin_number (CIN/incorporation number if found)
- revenue (revenue figures if found)
- profit (profit figures if found)

Return ONLY a JSON object with these field names as keys. Use null for fields not found.`,
    };

    const prompt = fieldPrompts[targetForm] || fieldPrompts.startup;

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
            content: "You are a document data extraction AI. Extract structured data from uploaded documents (KYC, incorporation certificates, PAN cards, Aadhaar, financial statements). Be precise. Return only JSON.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${fileBase64}` } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI extraction failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let extractedFields: Record<string, string> = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Filter out null values
        Object.entries(parsed).forEach(([k, v]) => {
          if (v !== null && v !== undefined && v !== "null" && v !== "") {
            extractedFields[k] = String(v);
          }
        });
      }
    } catch {
      extractedFields = { raw_text: content };
    }

    return new Response(JSON.stringify({ extractedFields }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PDF extract error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
