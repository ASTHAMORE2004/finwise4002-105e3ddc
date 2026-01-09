import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to?: string;
  type: string;
  name?: string;
  startupName?: string;
  companyName?: string;
  symbol?: string;
  reason?: string;
  email?: string;
  data?: Record<string, any>;
}

const getEmailContent = (type: string, params: EmailRequest) => {
  const { name, startupName, companyName, symbol, reason } = params;
  
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
        subject: `Congratulations! ${startupName} is Now Approved - FinWise`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">Your Startup is Approved!</h1>
            <p>Dear Founder,</p>
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
    case 'startup_rejected':
      return {
        subject: `Startup Registration Update - ${startupName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ef4444;">Startup Registration Not Approved</h1>
            <p>Dear Founder,</p>
            <p>We regret to inform you that <strong>${startupName}</strong> could not be approved at this time.</p>
            <p><strong>Reason:</strong> ${reason || 'Does not meet our current listing criteria.'}</p>
            <p>You may address the issues mentioned and resubmit your application.</p>
            <p>If you have questions, please contact our support team.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">This is an automated email from FinWise.</p>
          </div>
        `
      };
    case 'ipo_registration':
      return {
        subject: `IPO Registration Submitted - ${companyName || params.data?.company_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6366f1;">IPO Registration Received</h1>
            <p>Dear User,</p>
            <p>Your IPO registration for <strong>${companyName || params.data?.company_name} (${symbol || params.data?.symbol})</strong> has been submitted successfully.</p>
            <p>Our team will review your application and documents within 3-5 business days.</p>
            <p>You will receive an email notification once your IPO is approved for listing.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">This is an automated email from FinWise.</p>
          </div>
        `
      };
    case 'ipo_approved':
      return {
        subject: `IPO Approved - ${companyName} is Now Live!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">IPO Approved!</h1>
            <p>Dear User,</p>
            <p>Great news! The IPO for <strong>${companyName} (${symbol})</strong> has been approved and is now live on FinWise.</p>
            <p>Investors can now apply for this IPO during the subscription period.</p>
            <p>Thank you for listing with FinWise!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">This is an automated email from FinWise.</p>
          </div>
        `
      };
    case 'ipo_rejected':
      return {
        subject: `IPO Registration Update - ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ef4444;">IPO Registration Not Approved</h1>
            <p>Dear User,</p>
            <p>We regret to inform you that the IPO registration for <strong>${companyName}</strong> could not be approved.</p>
            <p><strong>Reason:</strong> ${reason || 'Does not meet our current listing criteria.'}</p>
            <p>You may address the issues mentioned and resubmit your application.</p>
            <p>If you have questions, please contact our support team.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">This is an automated email from FinWise.</p>
          </div>
        `
      };
    case 'payment_confirmation':
      return {
        subject: `Payment Successful - ${params.data?.courseName || 'Course Purchase'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">Payment Successful! 🎉</h1>
            <p>Dear ${name || 'Learner'},</p>
            <p>Thank you for your purchase! Your payment has been processed successfully.</p>
            <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Course:</strong> ${params.data?.courseName || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${params.data?.amount?.toLocaleString() || '0'}</p>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${params.data?.orderId || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
            </div>
            <p>You now have full access to all course content. Start learning now!</p>
            <a href="${params.data?.courseUrl || '#'}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 10px;">Start Learning</a>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">This is an automated email from FinWise. Please keep this for your records.</p>
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
    const body: EmailRequest = await req.json();
    const { to, email, type } = body;
    
    const recipientEmail = to || email;
    
    if (!recipientEmail) {
      console.log("No recipient email provided, skipping email send");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { subject, html } = getEmailContent(type, body);

    console.log(`Sending ${type} email to ${recipientEmail}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FinWise <onboarding@resend.dev>",
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
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
