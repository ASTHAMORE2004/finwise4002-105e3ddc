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

    const { transcript, meetingTopic, meetingType } = await req.json();

    if (!transcript || transcript.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Transcript too short for meaningful analysis. Record at least a few sentences." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `Analyze this ${meetingType || "investor-startup"} meeting transcript and provide a comprehensive summary:

**Meeting Topic:** ${meetingTopic || "Investment Discussion"}
**Transcript:**
${transcript}

Provide the following in a well-structured format:

## 📋 Meeting Summary
A 2-3 sentence overview of what was discussed.

## 🎯 Key Points
- Bullet points of the most important topics discussed

## 💡 Action Items
- Specific follow-up tasks with suggested owners (if identifiable)

## 📊 Investment Insights
- Any financial figures, valuations, or funding details mentioned
- Risk factors discussed
- Growth metrics or projections mentioned

## 🤝 Decisions Made
- Any agreements, commitments, or next steps decided

## ⚠️ Concerns Raised
- Any red flags, objections, or concerns mentioned

## 📅 Follow-up
- Suggested next meeting topics or deadlines mentioned`;

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
            content: `You are a meeting analyst AI for FinWise, specializing in investor-startup pitch meetings and financial consultations.
Extract maximum value from meeting transcripts. Be concise but thorough.
Format output with clear headings and bullet points using markdown.
If the transcript is from a pitch meeting, pay special attention to valuation, traction metrics, and investor concerns.`,
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
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
      console.error("AI summary error:", response.status, errText);
      throw new Error("Meeting analysis failed");
    }

    const aiResponse = await response.json();
    const summary = aiResponse.choices?.[0]?.message?.content || "Unable to generate summary.";

    console.log(`Meeting summary generated for user: ${user.id}, transcript length: ${transcript.length}`);

    return new Response(
      JSON.stringify({ success: true, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Meeting summary error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
