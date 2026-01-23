import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const { sessionId, type, ipoId, userId } = await req.json();

    console.log(`Verifying payment: sessionId=${sessionId}, type=${type}, ipoId=${ipoId}, userId=${userId}`);

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Session status:", session.payment_status);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, message: "Payment not completed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Payment is confirmed, update the database
    if (type === 'ipo' && ipoId && userId) {
      // Check current status
      const { data: application, error: fetchError } = await supabase
        .from("ipo_applications")
        .select("id, status")
        .eq("user_id", userId)
        .eq("ipo_id", ipoId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching application:", fetchError);
        throw fetchError;
      }

      console.log("Current application:", application);

      if (application && application.status !== 'confirmed') {
        const { error: updateError } = await supabase
          .from("ipo_applications")
          .update({
            status: "confirmed",
            upi_id: `stripe_${session.payment_intent}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", application.id);

        if (updateError) {
          console.error("Error updating application:", updateError);
          throw updateError;
        }

        console.log("Application updated to confirmed");

        // Send confirmation email
        if (resend) {
          const metadata = session.metadata || {};

          try {
            const [userResult, ipoResult, authUserResult] = await Promise.all([
              supabase.from("profiles").select("full_name").eq("user_id", userId).maybeSingle(),
              supabase.from("ipo_listings").select("company_name, lot_size").eq("id", ipoId).maybeSingle(),
              supabase.auth.admin.getUserById(userId),
            ]);

            const toEmail = authUserResult.data?.user?.email;
            const companyName = ipoResult.data?.company_name;

            if (!toEmail) {
              console.error("Email send skipped: could not resolve user email", { userId });
            } else if (!companyName) {
              console.error("Email send skipped: could not resolve IPO company name", { ipoId });
            } else {
              const emailResponse = await resend.emails.send({
                // NOTE: onboarding@resend.dev works for Resend's sandbox; for production,
                // you should verify a domain in Resend and use a sender like no-reply@yourdomain.
                from: "FinWise <onboarding@resend.dev>",
                to: [toEmail],
                subject: `IPO Application Confirmed - ${companyName}`,
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
                        <p>Dear ${userResult.data?.full_name || 'Investor'},</p>
                        <p>Congratulations! Your application for the <strong>${companyName}</strong> IPO has been confirmed.</p>

                        <div class="details">
                          <div class="detail-row">
                            <span class="label">Company</span>
                            <span class="value">${companyName}</span>
                          </div>
                          <div class="detail-row">
                            <span class="label">Number of Lots</span>
                            <span class="value">${metadata.lots || 1}</span>
                          </div>
                          <div class="detail-row">
                            <span class="label">Total Shares</span>
                            <span class="value">${metadata.shares || ipoResult.data?.lot_size || ''}</span>
                          </div>
                          <div class="detail-row">
                            <span class="label">Bid Price</span>
                            <span class="value">₹${parseFloat(metadata.bidPrice || '0').toLocaleString()}</span>
                          </div>
                        </div>

                        <div class="total">
                          <p style="margin: 0; font-size: 14px;">Total Amount Paid</p>
                          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold;">₹${((session.amount_total || 0) / 100).toLocaleString()}</p>
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

              // Resend v2 can return error in response instead of throwing; log both.
              console.log("Resend response:", JSON.stringify(emailResponse));

              // If the library returns an error field, surface it.
              // @ts-ignore - tolerate differing response shapes between runtimes.
              if (emailResponse?.error) {
                // @ts-ignore
                throw new Error(`Resend error: ${JSON.stringify(emailResponse.error)}`);
              }

              console.log("Confirmation email sent", { toEmail, companyName });
            }
          } catch (emailError) {
            console.error("Failed to send email:", emailError);
          }
        } else {
          console.log("Resend not configured, skipping email");
        }

        return new Response(
          JSON.stringify({ success: true, message: "Application confirmed", status: "confirmed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } else if (application?.status === 'confirmed') {
        // Already confirmed: still return success (email may have been delivered previously).
        return new Response(
          JSON.stringify({ success: true, message: "Already confirmed", status: "confirmed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});