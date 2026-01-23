import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const { 
      priceId, 
      courseId, 
      courseName, 
      amount, 
      userId, 
      successUrl, 
      cancelUrl,
      // IPO specific fields
      type = 'course', // 'course' or 'ipo'
      ipoId,
      ipoName,
      lots,
      shares,
      bidPrice
    } = await req.json();

    // Determine product details based on type
    const isIPO = type === 'ipo';
    const productName = isIPO 
      ? `${ipoName} IPO Application` 
      : (courseName || "Course Purchase");
    const productDescription = isIPO 
      ? `IPO Application: ${lots} lot(s), ${shares} shares @ ₹${bidPrice}` 
      : `Access to ${courseName}`;
    
    // Build success URL with session ID placeholder
    const baseSuccessUrl = successUrl || `${req.headers.get("origin")}/${isIPO ? 'ipo' : 'courses'}`;
    const baseCancelUrl = cancelUrl || `${req.headers.get("origin")}/${isIPO ? 'ipo' : 'courses'}?canceled=true`;
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: Math.round(amount * 100), // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseSuccessUrl}${baseSuccessUrl.includes('?') ? '&' : '?'}success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: baseCancelUrl,
      metadata: isIPO 
        ? { type: 'ipo', ipoId, userId, lots: String(lots), shares: String(shares), bidPrice: String(bidPrice) }
        : { type: 'course', courseId, userId },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
