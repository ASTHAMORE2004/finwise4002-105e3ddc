import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { query } = await req.json();
    if (!query) throw new Error("Search query required");

    // Fetch all searchable data
    const [startupsRes, iposRes, coursesRes] = await Promise.all([
      supabase.from("startup_registrations").select("id, startup_name, description, sector, funding_goal, valuation, status, equity_offered").in("status", ["approved", "live", "funded"]),
      supabase.from("ipo_listings").select("id, company_name, description, sector, price_band_low, price_band_high, status, issue_size").in("status", ["upcoming", "open", "listed"]),
      supabase.from("courses").select("id, title, description, category, difficulty, price, is_paid"),
    ]);

    const searchData = {
      startups: startupsRes.data || [],
      ipos: iposRes.data || [],
      courses: coursesRes.data || [],
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a semantic search AI for FinWise, a microinvestment platform. Given a natural language query and a database of startups, IPOs, and courses, return the most relevant results. Return ONLY valid JSON with:
- results: array of { id: string, type: "startup" | "ipo" | "course", name: string, relevance_score: number 0-100, match_reason: string, highlight: string }
- query_interpretation: string (how you understood the query)
- suggested_filters: array of { filter: string, value: string }
- total_matches: number
- did_you_mean: string | null (suggest alternative if query seems off)

Understand natural language like "cheap fintech startups", "beginner investing courses", "IPOs under 500 rupees". Max 10 results, sorted by relevance.`,
          },
          {
            role: "user",
            content: `Query: "${query}"\n\nDatabase:\n${JSON.stringify(searchData)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI search failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let searchResults = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) searchResults = JSON.parse(jsonMatch[0]);
    } catch {
      searchResults = { results: [], query_interpretation: content, total_matches: 0 };
    }

    return new Response(JSON.stringify({ searchResults }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Smart search error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
