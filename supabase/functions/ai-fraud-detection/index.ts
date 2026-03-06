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

    const { fileBase64, mimeType, documentType } = await req.json();
    if (!fileBase64) throw new Error("No file data provided");

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
            content: `You are a KYC fraud detection AI. Analyze uploaded identity documents for signs of tampering, forgery, or inconsistencies. Return ONLY valid JSON with:
- is_suspicious: boolean
- fraud_score: number 0-100 (0 = legitimate, 100 = definitely fraudulent)
- document_quality: "Poor" | "Fair" | "Good" | "Excellent"
- anomalies: array of { type: string, severity: "low" | "medium" | "high" | "critical", description: string, location: string }
- text_consistency: boolean (are all text elements consistent in font/style)
- image_quality_issues: array of strings
- verification_checks: array of { check: string, passed: boolean, details: string }
- recommendations: array of strings
- confidence: number 0-100 (confidence in your assessment)
- summary: 2-3 sentence assessment

Be thorough but fair. Flag genuine concerns without false positives.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze this ${documentType || "identity"} document for fraud indicators. Check for: tampering, inconsistent fonts, edited regions, misaligned text, unusual image artifacts, format violations.` },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${fileBase64}` } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI fraud detection failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let analysis = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
    } catch {
      analysis = { is_suspicious: false, fraud_score: 0, summary: content, confidence: 50 };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Fraud detection error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
