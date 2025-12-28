import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  type: 'kyc_submitted' | 'kyc_approved' | 'kyc_rejected' | 'startup_submitted' | 'startup_approved';
  name?: string;
  startupName?: string;
  reason?: string;
}

const getEmailContent = (type: string, name?: string, startupName?: string, reason?: string) => {
  switch (type) {
    case 'kyc_submitted':
      return {
        subject: 'KYC Documents Submitted - FinWise',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6366f1;">KYC Verification in Progress</h1>
            <p>Dear ${name || 'User'},</p>
            <p>We have received your KYC documents and they are currently under review.</p>
            <p>Our team will verify your documents within 24-48 hours. You will receive an email once the verification is complete.</p>
            <p>Thank you for choosing FinWise!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">This is an automated email from FinWise. Please do not reply.</p>
          </div>
        `
      };
    case 'kyc_approved':
      return {
        subject: 'KYC Verified Successfully - FinWise',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">KYC Verification Approved!</h1>
            <p>Dear ${name || 'User'},</p>
            <p>Congratulations! Your KYC verification has been approved.</p>
            <p>You now have full access to all investment features on FinWise, including:</p>
            <ul>
              <li>IPO Applications</li>
              <li>Startup Investments</li>
              <li>Premium Features</li>
            </ul>
            <p>Start exploring investment opportunities today!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">This is an automated email from FinWise.</p>
          </div>
        `
      };
    case 'startup_submitted':
      return {
        subject: `Startup Registration Submitted - ${startupName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6366f1;">Startup Registration Received</h1>
            <p>Dear ${name || 'Founder'},</p>
            <p>Thank you for registering <strong>${startupName}</strong> on FinWise!</p>
            <p>Our team will review your application within 3-5 business days. We'll notify you once your startup is approved for listing.</p>
            <p>In the meantime, make sure you have:</p>
            <ul>
              <li>Uploaded all required documents</li>
              <li>Completed KYC verification</li>
              <li>Prepared your pitch deck</li>
            </ul>
            <p>Best of luck with your venture!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">This is an automated email from FinWise.</p>
          </div>
        `
      };
    case 'startup_approved':
      return {
        subject: `Congratulations! ${startupName} is Now Live - FinWise`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">Your Startup is Live!</h1>
            <p>Dear ${name || 'Founder'},</p>
            <p>Great news! <strong>${startupName}</strong> has been approved and is now live on FinWise.</p>
            <p>Investors can now discover and invest in your startup. Here's what to do next:</p>
            <ul>
              <li>Share your listing with potential investors</li>
              <li>Engage with the community</li>
              <li>Keep your profile updated</li>
            </ul>
            <p>We're excited to be part of your journey!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">This is an automated email from FinWise.</p>
          </div>
        `
      };
    default:
      return { subject: 'Update from FinWise', html: '<p>You have a new update from FinWise.</p>' };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, type, name, startupName, reason }: EmailRequest = await req.json();

    const { subject, html } = getEmailContent(type, name, startupName, reason);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FinWise <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
