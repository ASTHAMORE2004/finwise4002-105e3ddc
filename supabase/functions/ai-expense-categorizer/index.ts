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

    const { transactions, mode } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "categorize") {
      systemPrompt = `You are an expense categorization AI for Indian users. Categorize transactions into: Food & Dining, Transportation, Entertainment, Shopping, Bills & Utilities, Education, Health, Investment, Income, Subscriptions, Other. Return JSON array of { original_name: string, category: string, subcategory: string, is_essential: boolean, saving_tip: string }`;
      userPrompt = `Categorize these transactions:\n${JSON.stringify(transactions)}`;
    } else if (mode === "analyze") {
      systemPrompt = `You are a spending analysis AI. Analyze expense patterns and return JSON with:
- total_spent: number
- category_breakdown: array of { category: string, amount: number, percentage: number, trend: "increasing" | "decreasing" | "stable" }
- spending_score: number 1-100 (higher = better spending habits)
- top_savings_opportunities: array of { category: string, potential_saving: number, suggestion: string }
- monthly_forecast: number (predicted next month spend)
- insights: array of 3-5 actionable spending insights
- wasteful_spending: array of identified wasteful patterns`;
      userPrompt = `Analyze these expenses for an Indian student/young professional:\n${JSON.stringify(transactions)}`;
    } else {
      throw new Error("Invalid mode. Use 'categorize' or 'analyze'.");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
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

    let result = {};
    try {
      const jsonMatch = content.match(/[\[{][\s\S]*[\]}]/);
      if (jsonMatch) result = JSON.parse(jsonMatch[0]);
    } catch {
      result = { raw: content };
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Expense categorizer error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
