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

    const { type, startup } = await req.json();
    if (!startup?.name) throw new Error("Startup data required");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "questions") {
      systemPrompt = `You are an expert venture capital investor. Generate 8-10 tough but fair investor questions for a startup pitch meeting. Return a JSON array of objects with fields: category (e.g. "Market", "Revenue", "Team", "Product", "Traction", "Risk"), question, tip (a short hint for the founder on how to answer well).`;
      userPrompt = `Startup: ${startup.name}
Description: ${startup.description || "N/A"}
Sector: ${startup.sector || "N/A"}
Funding Goal: ₹${startup.funding_goal || "N/A"}
Equity Offered: ${startup.equity_offered || "N/A"}%
Valuation: ₹${startup.valuation || "N/A"}
Team Size: ${startup.team_size || "N/A"}

Generate tailored investor questions for this startup.`;
    } else if (type === "pitch") {
      systemPrompt = `You are an expert pitch coach. Generate a compelling 3-minute investor pitch script for a startup. The script should cover: Hook/Problem, Solution, Market Size, Business Model, Traction, Team, and Ask. Write it as a natural speaking script with clear sections. Return as plain text.`;
      userPrompt = `Startup: ${startup.name}
Description: ${startup.description || "N/A"}
Sector: ${startup.sector || "N/A"}
Funding Goal: ₹${startup.funding_goal || "N/A"}
Equity Offered: ${startup.equity_offered || "N/A"}%
Valuation: ₹${startup.valuation || "N/A"}
Team Size: ${startup.team_size || "N/A"}
Founded: ${startup.founded_year || "N/A"}

Generate a compelling pitch script.`;
    } else {
      throw new Error("Invalid type. Use 'questions' or 'pitch'.");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI request failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    if (type === "questions") {
      let questions = [];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
      } catch {
        questions = [{ category: "General", question: content, tip: "Be concise and data-driven." }];
      }
      return new Response(JSON.stringify({ questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ pitchScript: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Investor prep error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
