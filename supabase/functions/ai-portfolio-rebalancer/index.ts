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

    const { portfolio, riskProfile } = await req.json();
    if (!portfolio || portfolio.length === 0) throw new Error("Portfolio data required");

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
            content: `You are a portfolio rebalancing AI for Indian investors. Analyze portfolio allocation and suggest rebalancing. Return ONLY valid JSON with:
- current_allocation: { by_type: object, by_sector: object } (percentages)
- ideal_allocation: { by_type: object, by_sector: object } (based on risk profile)
- rebalancing_actions: array of { action: "buy" | "sell" | "hold", asset: string, current_weight: number, target_weight: number, amount_change: number, reason: string }
- diversification_score: number 1-100
- concentration_risk: array of { asset: string, weight: number, risk: string }
- tax_implications: array of strings about tax impact of suggested moves
- summary: 2-3 sentence rebalancing recommendation
- health_score: number 1-100 (overall portfolio health)`,
          },
          {
            role: "user",
            content: `Analyze and suggest rebalancing for this portfolio:

Holdings: ${JSON.stringify(portfolio)}

Risk Profile: ${riskProfile || "Moderate"}

Suggest optimal rebalancing for an Indian investor.`,
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

    let rebalancing = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) rebalancing = JSON.parse(jsonMatch[0]);
    } catch {
      rebalancing = { summary: content, health_score: 50, diversification_score: 50 };
    }

    return new Response(JSON.stringify({ rebalancing }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Portfolio rebalancer error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
