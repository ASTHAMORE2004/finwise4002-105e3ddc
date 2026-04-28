import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are KUBER, an expert AI financial advisor for FinWise — a microinvestment platform built for Indian students and early earners.

## Your role
- Friendly, patient, encouraging. Use simple language and the occasional emoji.
- Give concrete, actionable financial advice grounded in math, not vibes.
- Use Indian Rupee (₹) and Indian context (SIP, ELSS, PPF, NPS, EPF, mutual funds, IPO, IBEX/NIFTY).

## Tools (USE THEM — do not do math in your head)
You have function-calling tools that perform exact financial calculations:
- **calculate_sip** — Future value of monthly SIP investments
- **calculate_lumpsum** — Future value of a one-time investment
- **calculate_required_sip** — How much to invest monthly to reach a target corpus
- **calculate_goal_timeline** — How long to reach a goal at a given monthly contribution
- **calculate_cagr** — Compound Annual Growth Rate from start/end values
- **calculate_emi** — Loan EMI (principal, rate, tenure)

**Rules**:
1. ANY time the user mentions amounts, returns, years, or "how much" / "how long" / "what if", you MUST call the appropriate tool. Never guess numbers.
2. After the tool returns, explain the result in plain English with one short actionable insight.
3. If the user provides incomplete info (e.g., asks "should I do SIP?" with no numbers), ask 1–2 short follow-up questions, OR offer a sensible default (e.g., "Let's assume ₹5,000/month at 12% for 10 years…") and run the tool.
4. Default expected return assumption: equity mutual funds 12% p.a., debt 7% p.a., FD 6.5% p.a., IBEX historical ~7% p.a.

## User context
If user portfolio / goals data is provided in the system context below, USE IT to personalize advice (mention their actual holdings, goal gaps, etc.).

## Boundaries
- You provide education and math, not SEBI-registered advice. Mention this once if asked for stock picks.
- Encourage starting small and being consistent. Every ₹100 counts.
- Keep prose tight: 2–4 short paragraphs max, use bullet lists for steps.`;

const tools = [
  {
    type: "function",
    function: {
      name: "calculate_sip",
      description: "Future value of a monthly SIP. Use whenever user asks about monthly investing outcomes.",
      parameters: {
        type: "object",
        properties: {
          monthly_amount: { type: "number", description: "Monthly SIP amount in INR" },
          annual_return_percent: { type: "number", description: "Expected annual return in percent (e.g., 12 for 12%)" },
          years: { type: "number", description: "Investment duration in years" },
        },
        required: ["monthly_amount", "annual_return_percent", "years"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_lumpsum",
      description: "Future value of a one-time lump-sum investment.",
      parameters: {
        type: "object",
        properties: {
          principal: { type: "number" },
          annual_return_percent: { type: "number" },
          years: { type: "number" },
        },
        required: ["principal", "annual_return_percent", "years"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_required_sip",
      description: "Required monthly SIP to reach a target corpus by a given deadline.",
      parameters: {
        type: "object",
        properties: {
          target_amount: { type: "number" },
          annual_return_percent: { type: "number" },
          years: { type: "number" },
        },
        required: ["target_amount", "annual_return_percent", "years"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_goal_timeline",
      description: "Years needed to reach a goal given a monthly contribution and expected return.",
      parameters: {
        type: "object",
        properties: {
          target_amount: { type: "number" },
          monthly_amount: { type: "number" },
          annual_return_percent: { type: "number" },
          current_amount: { type: "number", description: "Current saved amount, default 0" },
        },
        required: ["target_amount", "monthly_amount", "annual_return_percent"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_cagr",
      description: "Compound Annual Growth Rate from start and end values.",
      parameters: {
        type: "object",
        properties: {
          start_value: { type: "number" },
          end_value: { type: "number" },
          years: { type: "number" },
        },
        required: ["start_value", "end_value", "years"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_emi",
      description: "Monthly EMI for a loan.",
      parameters: {
        type: "object",
        properties: {
          principal: { type: "number" },
          annual_rate_percent: { type: "number" },
          years: { type: "number" },
        },
        required: ["principal", "annual_rate_percent", "years"],
      },
    },
  },
];

// ===== Calculator implementations =====
function fmt(n: number) {
  return Math.round(n * 100) / 100;
}

function runTool(name: string, args: any): any {
  switch (name) {
    case "calculate_sip": {
      const { monthly_amount, annual_return_percent, years } = args;
      const r = annual_return_percent / 100 / 12;
      const n = years * 12;
      const fv = monthly_amount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      const invested = monthly_amount * n;
      return {
        future_value: fmt(fv),
        total_invested: fmt(invested),
        wealth_gained: fmt(fv - invested),
        currency: "INR",
        assumptions: { monthly_amount, annual_return_percent, years },
      };
    }
    case "calculate_lumpsum": {
      const { principal, annual_return_percent, years } = args;
      const fv = principal * Math.pow(1 + annual_return_percent / 100, years);
      return {
        future_value: fmt(fv),
        total_invested: principal,
        wealth_gained: fmt(fv - principal),
        currency: "INR",
        assumptions: { principal, annual_return_percent, years },
      };
    }
    case "calculate_required_sip": {
      const { target_amount, annual_return_percent, years } = args;
      const r = annual_return_percent / 100 / 12;
      const n = years * 12;
      const monthly = target_amount / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
      return {
        required_monthly_sip: fmt(monthly),
        target_amount,
        years,
        annual_return_percent,
        currency: "INR",
      };
    }
    case "calculate_goal_timeline": {
      const { target_amount, monthly_amount, annual_return_percent, current_amount = 0 } = args;
      const r = annual_return_percent / 100 / 12;
      // Solve for n: target = current*(1+r)^n + monthly*((1+r)^n - 1)/r * (1+r)
      // Iteratively
      let n = 0;
      let value = current_amount;
      while (value < target_amount && n < 12 * 100) {
        value = value * (1 + r) + monthly_amount;
        n++;
      }
      const years = n / 12;
      return {
        years_to_goal: fmt(years),
        months_to_goal: n,
        projected_corpus: fmt(value),
        target_amount,
        monthly_amount,
        currency: "INR",
      };
    }
    case "calculate_cagr": {
      const { start_value, end_value, years } = args;
      const cagr = (Math.pow(end_value / start_value, 1 / years) - 1) * 100;
      return {
        cagr_percent: fmt(cagr),
        start_value,
        end_value,
        years,
      };
    }
    case "calculate_emi": {
      const { principal, annual_rate_percent, years } = args;
      const r = annual_rate_percent / 100 / 12;
      const n = years * 12;
      const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = emi * n;
      return {
        monthly_emi: fmt(emi),
        total_payment: fmt(totalPayment),
        total_interest: fmt(totalPayment - principal),
        principal,
        currency: "INR",
      };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

async function fetchUserContext(authHeader: string | null): Promise<string> {
  if (!authHeader) return "";
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "";

    const [profileRes, portfolioRes, goalsRes] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_portfolio").select("investment_name,symbol,invested_amount,current_value,investment_type").eq("user_id", user.id).eq("status", "active").limit(20),
      supabase.from("financial_goals").select("name,target_amount,current_amount,deadline,linked_ticker,monthly_contribution").eq("user_id", user.id).eq("status", "active").limit(10),
    ]);

    const name = profileRes.data?.full_name || user.email?.split("@")[0] || "there";
    const portfolio = portfolioRes.data || [];
    const goals = goalsRes.data || [];

    const totalInvested = portfolio.reduce((s, p) => s + Number(p.invested_amount || 0), 0);
    const totalValue = portfolio.reduce((s, p) => s + Number(p.current_value || p.invested_amount || 0), 0);

    let ctx = `\n\n## Logged-in user context\nName: ${name}\nEmail: ${user.email}\n`;
    if (portfolio.length) {
      ctx += `\nPortfolio (${portfolio.length} holdings, ₹${Math.round(totalInvested).toLocaleString("en-IN")} invested, current ₹${Math.round(totalValue).toLocaleString("en-IN")}):\n`;
      portfolio.slice(0, 10).forEach(p => {
        ctx += `- ${p.investment_name} (${p.symbol || p.investment_type}): invested ₹${Number(p.invested_amount).toLocaleString("en-IN")}\n`;
      });
    } else {
      ctx += `\nNo investments yet — encourage them to start small.\n`;
    }
    if (goals.length) {
      ctx += `\nFinancial goals:\n`;
      goals.forEach(g => {
        const pct = g.target_amount ? ((Number(g.current_amount) / Number(g.target_amount)) * 100).toFixed(1) : "0";
        ctx += `- ${g.name}: ₹${Number(g.current_amount).toLocaleString("en-IN")} / ₹${Number(g.target_amount).toLocaleString("en-IN")} (${pct}%), deadline ${g.deadline || "n/a"}, monthly SIP ₹${g.monthly_contribution || 0}, linked ${g.linked_ticker || "none"}\n`;
      });
    }
    return ctx;
  } catch (e) {
    console.error("Context fetch failed:", e);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userContext = await fetchUserContext(req.headers.get("Authorization"));
    const systemContent = SYSTEM_PROMPT + userContext;

    let workingMessages = [
      { role: "system", content: systemContent },
      ...messages,
    ];

    // Tool-calling loop (max 4 iterations to avoid runaway)
    for (let i = 0; i < 4; i++) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: workingMessages,
          tools,
          tool_choice: "auto",
          stream: false,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited. Please wait a moment." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errText = await response.text();
        console.error("AI gateway error:", response.status, errText);
        return new Response(JSON.stringify({ error: "AI service error" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const msg = choice?.message;

      if (msg?.tool_calls && msg.tool_calls.length > 0) {
        // Execute tools, append results, loop
        workingMessages.push(msg);
        for (const tc of msg.tool_calls) {
          const args = JSON.parse(tc.function.arguments || "{}");
          const result = runTool(tc.function.name, args);
          console.log(`KUBER tool ${tc.function.name}:`, args, "→", result);
          workingMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          });
        }
        continue;
      }

      // Final text response
      const finalContent = msg?.content || "I couldn't generate a response. Please try again.";
      return new Response(JSON.stringify({ content: finalContent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ content: "Sorry, I got stuck in a calculation loop. Please rephrase." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("KUBER chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
