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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!stripeKey) throw new Error("Stripe secret key not configured");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase configuration missing");

    // JWT Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey!, {
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const { sessionId, type, ipoId, userId } = await req.json();

    // Verify the userId matches the authenticated user
    if (userId && userId !== authenticatedUserId) {
      return new Response(JSON.stringify({ error: "User mismatch" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const verifiedUserId = userId || authenticatedUserId;

    console.log(`Verifying payment: sessionId=${sessionId}, type=${type}, userId=${verifiedUserId}`);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, message: "Payment not completed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (type === 'ipo' && ipoId && verifiedUserId) {
      const { data: application, error: fetchError } = await supabase
        .from("ipo_applications")
        .select("id, status")
        .eq("user_id", verifiedUserId)
        .eq("ipo_id", ipoId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (application && application.status !== 'confirmed') {
        const { error: updateError } = await supabase
          .from("ipo_applications")
          .update({
            status: "confirmed",
            upi_id: `stripe_${session.payment_intent}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", application.id);

        if (updateError) throw updateError;

        // Send confirmation email
        if (resend) {
          const metadata = session.metadata || {};
          try {
            const [userResult, ipoResult, authUserResult] = await Promise.all([
              supabase.from("profiles").select("full_name").eq("user_id", verifiedUserId).maybeSingle(),
              supabase.from("ipo_listings").select("company_name, lot_size").eq("id", ipoId).maybeSingle(),
              supabase.auth.admin.getUserById(verifiedUserId),
            ]);

            const toEmail = authUserResult.data?.user?.email;
            const companyName = ipoResult.data?.company_name;

            if (toEmail && companyName) {
              await resend.emails.send({
                from: "FinWise <onboarding@resend.dev>",
                to: [toEmail],
                subject: `IPO Application Confirmed - ${companyName}`,
                html: `
                  <!DOCTYPE html>
                  <html><head><style>
                    body { font-family: 'Segoe UI', sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                    .total { background: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px; }
                  </style></head><body>
                    <div class="container">
                      <div class="header">
                        <div style="font-size: 48px;">✓</div>
                        <h1 style="margin: 0;">Application Confirmed!</h1>
                      </div>
                      <div class="content">
                        <p>Dear ${userResult.data?.full_name || 'Investor'},</p>
                        <p>Your application for <strong>${companyName}</strong> IPO has been confirmed.</p>
                        <div class="details">
                          <div class="detail-row"><span>Lots</span><span><strong>${metadata.lots || 1}</strong></span></div>
                          <div class="detail-row"><span>Shares</span><span><strong>${metadata.shares || ''}</strong></span></div>
                          <div class="detail-row"><span>Bid Price</span><span><strong>₹${parseFloat(metadata.bidPrice || '0').toLocaleString()}</strong></span></div>
                        </div>
                        <div class="total">
                          <p style="margin:0;font-size:14px;">Total Amount</p>
                          <p style="margin:5px 0 0;font-size:24px;font-weight:bold;">₹${((session.amount_total || 0) / 100).toLocaleString()}</p>
                        </div>
                        <p style="margin-top:20px;">Track your application status in your portfolio. Allotment updates will follow within 24 hours as per SEBI guidelines.</p>
                      </div>
                    </div>
                  </body></html>
                `,
              });
              console.log("Confirmation email sent to", toEmail);
            }
          } catch (emailError) {
            console.error("Email error:", emailError);
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: "Application confirmed", status: "confirmed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } else if (application?.status === 'confirmed') {
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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
