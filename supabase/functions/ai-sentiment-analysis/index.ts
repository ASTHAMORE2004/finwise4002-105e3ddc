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

    const { startup } = await req.json();
    if (!startup?.startup_name) throw new Error("Startup data required");

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
            content: `You are a financial sentiment analysis AI. Analyze startups and return a JSON object with:
- overall_sentiment: "Bullish" | "Bearish" | "Neutral"
- confidence: number 0-100
- factors: array of { factor: string, sentiment: "positive" | "negative" | "neutral", weight: number 1-10, reasoning: string }
- summary: 2-3 sentence analysis
- risk_level: "Low" | "Medium" | "High" | "Very High"
- recommendation: brief actionable recommendation
Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Analyze sentiment for this startup:
Name: ${startup.startup_name}
Sector: ${startup.sector || "N/A"}
Description: ${startup.description || "N/A"}
Funding Goal: ₹${startup.funding_goal || "N/A"}
Raised: ₹${startup.raised_amount || 0}
Valuation: ₹${startup.valuation || "N/A"}
Equity Offered: ${startup.equity_offered || "N/A"}%
Team Size: ${startup.team_size || "N/A"}
Founded: ${startup.founded_year || "N/A"}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI request failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let analysis = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
    } catch {
      analysis = { overall_sentiment: "Neutral", confidence: 50, summary: content, risk_level: "Medium", factors: [], recommendation: "Insufficient data for analysis." };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
