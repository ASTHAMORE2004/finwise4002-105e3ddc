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

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase configuration missing");

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

    // Fetch user's portfolio
    const { data: portfolio, error: portfolioError } = await authClient
      .from("user_portfolio")
      .select("*")
      .eq("status", "active");

    if (portfolioError) throw portfolioError;

    // Fetch user's IPO applications
    const { data: ipoApps, error: ipoError } = await authClient
      .from("ipo_applications")
      .select("*, ipo_listings(company_name, symbol, sector)");

    if (ipoError) throw ipoError;

    if (!portfolio || portfolio.length === 0) {
      return new Response(
        JSON.stringify({ insights: "You don't have any investments yet. Start by adding stocks, mutual funds, or applying for IPOs to get personalized AI insights!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build portfolio summary for AI
    const totalInvested = portfolio.reduce((s, i) => s + Number(i.invested_amount), 0);
    const totalValue = portfolio.reduce((s, i) => s + Number(i.current_value || i.invested_amount), 0);
    const returns = totalValue - totalInvested;
    const returnsPct = totalInvested > 0 ? ((returns / totalInvested) * 100).toFixed(2) : "0";

    const sectorBreakdown = portfolio.reduce((acc: Record<string, number>, item) => {
      const sector = item.sector || "Unknown";
      acc[sector] = (acc[sector] || 0) + Number(item.current_value || item.invested_amount);
      return acc;
    }, {});

    const typeBreakdown = portfolio.reduce((acc: Record<string, number>, item) => {
      acc[item.investment_type] = (acc[item.investment_type] || 0) + Number(item.current_value || item.invested_amount);
      return acc;
    }, {});

    const holdings = portfolio.map(h => ({
      name: h.investment_name,
      type: h.investment_type,
      sector: h.sector,
      invested: h.invested_amount,
      current: h.current_value || h.invested_amount,
      pnl: ((Number(h.current_value || h.invested_amount) - Number(h.invested_amount)) / Number(h.invested_amount) * 100).toFixed(2) + "%",
    }));

    const prompt = `Analyze this Indian student investor's portfolio and provide actionable insights:

**Portfolio Summary:**
- Total Invested: ₹${totalInvested.toLocaleString()}
- Current Value: ₹${totalValue.toLocaleString()}
- Overall Returns: ${returnsPct}%
- Number of Holdings: ${portfolio.length}

**Sector Breakdown:** ${JSON.stringify(sectorBreakdown)}
**Type Breakdown:** ${JSON.stringify(typeBreakdown)}

**Individual Holdings:**
${JSON.stringify(holdings, null, 2)}

**IPO Applications:** ${ipoApps?.length || 0} applications

Provide insights in this format:
1. **Portfolio Health Score** (1-10 with brief explanation)
2. **Risk Assessment** (Conservative/Moderate/Aggressive and why)
3. **Diversification Analysis** (sector concentration, asset allocation gaps)
4. **Top Recommendations** (2-3 specific actionable suggestions)
5. **Red Flags** (any concerns like over-concentration, poor performers)

Keep it concise, practical, and tailored for an Indian student investor. Use ₹ for currency.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a SEBI-compliant financial analysis AI for FinWise, a student microinvestment platform. Provide educational insights, not financial advice. Always include a disclaimer.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
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
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiResponse = await response.json();
    const insights = aiResponse.choices?.[0]?.message?.content || "Unable to generate insights at this time.";

    return new Response(
      JSON.stringify({ insights, portfolioSummary: { totalInvested, totalValue, returns, returnsPct, holdingsCount: portfolio.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Portfolio insights error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
