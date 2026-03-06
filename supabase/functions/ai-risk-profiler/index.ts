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

    const { answers, portfolio } = await req.json();
    if (!answers) throw new Error("Quiz answers required");

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
            content: `You are a certified financial risk assessment AI for Indian investors. Based on quiz answers, generate a comprehensive risk profile. Return ONLY valid JSON with:
- risk_score: number 1-100
- risk_category: "Conservative" | "Moderate" | "Aggressive" | "Very Aggressive"
- ideal_allocation: { equity: number, debt: number, gold: number, cash: number } (percentages summing to 100)
- recommended_instruments: array of { name: string, type: string, risk_level: string, expected_return: string, reason: string }
- personality_traits: array of strings describing investor personality
- advice: array of 3-5 personalized tips
- summary: 2-3 sentence profile summary`,
          },
          {
            role: "user",
            content: `Risk assessment quiz answers:
${JSON.stringify(answers, null, 2)}

Current portfolio summary (if any):
${portfolio ? JSON.stringify(portfolio, null, 2) : "No existing portfolio"}

Generate a personalized risk profile for this Indian student/early earner investor.`,
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

    let profile = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) profile = JSON.parse(jsonMatch[0]);
    } catch {
      profile = { risk_score: 50, risk_category: "Moderate", summary: content };
    }

    return new Response(JSON.stringify({ profile }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Risk profiler error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
