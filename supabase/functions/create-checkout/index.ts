import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    // JWT Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authenticatedUserId = claimsData.claims.sub;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const { 
      priceId, courseId, courseName, amount, userId, successUrl, cancelUrl,
      type = 'course', ipoId, ipoName, lots, shares, bidPrice
    } = await req.json();

    // Verify user matches authenticated user
    const verifiedUserId = authenticatedUserId;

    const isIPO = type === 'ipo';
    const productName = isIPO 
      ? `${ipoName} IPO Application` 
      : (courseName || "Course Purchase");
    const productDescription = isIPO 
      ? `IPO Application: ${lots} lot(s), ${shares} shares @ ₹${bidPrice}` 
      : `Access to ${courseName}`;
    
    const baseSuccessUrl = successUrl || `${req.headers.get("origin")}/${isIPO ? 'ipo' : 'courses'}`;
    const baseCancelUrl = cancelUrl || `${req.headers.get("origin")}/${isIPO ? 'ipo' : 'courses'}?canceled=true`;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: productName, description: productDescription },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseSuccessUrl}${baseSuccessUrl.includes('?') ? '&' : '?'}success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: baseCancelUrl,
      metadata: isIPO 
        ? { type: 'ipo', ipoId, userId: verifiedUserId, lots: String(lots), shares: String(shares), bidPrice: String(bidPrice) }
        : { type: 'course', courseId, userId: verifiedUserId },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
