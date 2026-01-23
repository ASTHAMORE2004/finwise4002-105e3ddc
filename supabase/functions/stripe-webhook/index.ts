import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

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

    // Initialize Resend for emails
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

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

    // Helper function to send confirmation email
    async function sendIPOConfirmationEmail(
      userEmail: string,
      userName: string,
      ipoName: string,
      lots: number,
      shares: number,
      amount: number,
      bidPrice: number
    ) {
      if (!resend) {
        console.log("Resend not configured, skipping email");
        return;
      }

      try {
        const emailResponse = await resend.emails.send({
          from: "FinWise <onboarding@resend.dev>",
          to: [userEmail],
          subject: `IPO Application Confirmed - ${ipoName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .success-icon { font-size: 48px; margin-bottom: 10px; }
                .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                .detail-row:last-child { border-bottom: none; }
                .label { color: #6b7280; }
                .value { font-weight: 600; color: #111827; }
                .total { background: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="success-icon">✓</div>
                  <h1 style="margin: 0;">Application Confirmed!</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Your IPO application has been successfully submitted</p>
                </div>
                <div class="content">
                  <p>Dear ${userName || 'Investor'},</p>
                  <p>Congratulations! Your application for the <strong>${ipoName}</strong> IPO has been confirmed. Here are your application details:</p>
                  
                  <div class="details">
                    <div class="detail-row">
                      <span class="label">Company</span>
                      <span class="value">${ipoName}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Number of Lots</span>
                      <span class="value">${lots}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Total Shares</span>
                      <span class="value">${shares}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Bid Price</span>
                      <span class="value">₹${bidPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div class="total">
                    <p style="margin: 0; font-size: 14px;">Total Amount Paid</p>
                    <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold;">₹${amount.toLocaleString()}</p>
                  </div>
                  
                  <p style="margin-top: 20px;">The allotment status will be updated once the IPO closes. You can track your application status in your portfolio.</p>
                  
                  <p>Thank you for investing with FinWise!</p>
                </div>
                <div class="footer">
                  <p>This is an automated email from FinWise. Please do not reply to this email.</p>
                  <p>© 2026 FinWise. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        console.log("IPO confirmation email sent:", emailResponse);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);
        console.log("Session metadata:", JSON.stringify(session.metadata));

        const metadata = session.metadata || {};
        const paymentType = metadata.type || 'course';

        if (paymentType === 'ipo') {
          // Handle IPO payment
          const { ipoId, userId, lots, shares, bidPrice } = metadata;

          if (!ipoId || !userId) {
            console.error("Missing IPO metadata in checkout session:", metadata);
            break;
          }

          console.log(`Processing IPO application: userId=${userId}, ipoId=${ipoId}`);

          // Update existing pending IPO application
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

          console.log("Existing application:", existingApplication);

          if (existingApplication) {
            const { error: updateError } = await supabase
              .from("ipo_applications")
              .update({
                status: "confirmed",
                upi_id: `stripe_${session.payment_intent}`,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingApplication.id);

            if (updateError) {
              console.error("Error updating IPO application:", updateError);
            } else {
              console.log(`IPO application confirmed for user ${userId}, IPO ${ipoId}`);

              // Fetch user email and IPO details for email notification
              const [userResult, ipoResult] = await Promise.all([
                supabase.from("profiles").select("full_name").eq("user_id", userId).maybeSingle(),
                supabase.from("ipo_listings").select("company_name").eq("id", ipoId).maybeSingle(),
              ]);

              // Get user email from auth
              const { data: authUser } = await supabase.auth.admin.getUserById(userId);

              if (authUser?.user?.email && ipoResult.data) {
                await sendIPOConfirmationEmail(
                  authUser.user.email,
                  userResult.data?.full_name || '',
                  ipoResult.data.company_name,
                  parseInt(lots) || 1,
                  parseInt(shares) || 0,
                  (session.amount_total || 0) / 100,
                  parseFloat(bidPrice) || 0
                );
              }
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
                upi_id: `stripe_${session.payment_intent}`,
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
              .update({ status: "payment_expired", updated_at: new Date().toISOString() })
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