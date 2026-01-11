import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !webhookSecret) {
      console.error("Missing Stripe configuration");
      throw new Error("Stripe configuration missing");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Supabase configuration missing");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return new Response(
        JSON.stringify({ error: "No signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Received Stripe event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);

        const metadata = session.metadata || {};
        const paymentType = metadata.type || 'course';

        if (paymentType === 'ipo') {
          // Handle IPO payment
          const { ipoId, userId, lots, shares, bidPrice } = metadata;

          if (!ipoId || !userId) {
            console.error("Missing IPO metadata in checkout session:", metadata);
            break;
          }

          // Update existing pending IPO application or create new one
          const { data: existingApplication, error: fetchError } = await supabase
            .from("ipo_applications")
            .select("id")
            .eq("user_id", userId)
            .eq("ipo_id", ipoId)
            .eq("status", "pending_payment")
            .maybeSingle();

          if (fetchError) {
            console.error("Error fetching IPO application:", fetchError);
          }

          if (existingApplication) {
            const { error: updateError } = await supabase
              .from("ipo_applications")
              .update({
                status: "confirmed",
                payment_id: session.payment_intent as string,
              })
              .eq("id", existingApplication.id);

            if (updateError) {
              console.error("Error updating IPO application:", updateError);
            } else {
              console.log(`IPO application confirmed for user ${userId}, IPO ${ipoId}`);
            }
          } else {
            // Create new application if none exists
            const { error: insertError } = await supabase
              .from("ipo_applications")
              .insert({
                user_id: userId,
                ipo_id: ipoId,
                lots_applied: parseInt(lots) || 1,
                bid_price: parseFloat(bidPrice) || 0,
                amount: (session.amount_total || 0) / 100,
                status: "confirmed",
                upi_id: "stripe_payment",
              });

            if (insertError) {
              console.error("Error inserting IPO application:", insertError);
            } else {
              console.log(`New IPO application created for user ${userId}, IPO ${ipoId}`);
            }
          }
        } else {
          // Handle course payment
          const { courseId, userId } = metadata;

          if (!courseId || !userId) {
            console.error("Missing course metadata in checkout session:", metadata);
            break;
          }

          // Update the payment status to completed
          const { data: existingPayment, error: fetchError } = await supabase
            .from("course_payments")
            .select("id")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .eq("payment_status", "pending")
            .maybeSingle();

          if (fetchError) {
            console.error("Error fetching payment:", fetchError);
          }

          if (existingPayment) {
            const { error: updateError } = await supabase
              .from("course_payments")
              .update({
                payment_status: "completed",
                payment_id: session.payment_intent as string,
              })
              .eq("id", existingPayment.id);

            if (updateError) {
              console.error("Error updating payment:", updateError);
            } else {
              console.log(`Payment updated for user ${userId}, course ${courseId}`);
            }
          } else {
            const { error: insertError } = await supabase
              .from("course_payments")
              .insert({
                user_id: userId,
                course_id: courseId,
                amount: (session.amount_total || 0) / 100,
                currency: session.currency?.toUpperCase() || "INR",
                payment_status: "completed",
                payment_id: session.payment_intent as string,
                order_id: `ORD-${Date.now()}`,
              });

            if (insertError) {
              console.error("Error inserting payment:", insertError);
            } else {
              console.log(`New payment created for user ${userId}, course ${courseId}`);
            }
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session expired:", session.id);

        const metadata = session.metadata || {};
        const paymentType = metadata.type || 'course';

        if (paymentType === 'ipo') {
          const { ipoId, userId } = metadata;
          if (ipoId && userId) {
            const { error } = await supabase
              .from("ipo_applications")
              .update({ status: "payment_expired" })
              .eq("user_id", userId)
              .eq("ipo_id", ipoId)
              .eq("status", "pending_payment");

            if (error) {
              console.error("Error updating expired IPO application:", error);
            }
          }
        } else {
          const { courseId, userId } = metadata;
          if (courseId && userId) {
            const { error } = await supabase
              .from("course_payments")
              .update({ payment_status: "expired" })
              .eq("user_id", userId)
              .eq("course_id", courseId)
              .eq("payment_status", "pending");

            if (error) {
              console.error("Error updating expired payment:", error);
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
