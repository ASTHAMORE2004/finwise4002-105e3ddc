import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    case 'welcome':
      return {
        subject: 'Welcome to FinWise! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0;">Welcome to FinWise!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Dear ${name || 'Investor'},</p>
              <p>Welcome aboard! Your account has been created successfully. Start your financial journey today.</p>
              <ul><li>Complete your KYC verification</li><li>Explore IPOs and startups</li><li>Take free financial courses</li></ul>
              <p>Happy investing!</p>
            </div>
          </div>
        `
      };
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
            <p>You now have full access to all investment features on FinWise.</p>
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
            <p>Our team will review your application within 3-5 business days.</p>
          </div>
        `
      };
    case 'startup_approved':
      return {
        subject: `Congratulations! ${startupName} is Now Approved - FinWise`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">Your Startup is Approved!</h1>
            <p><strong>${startupName}</strong> has been approved and is now live on FinWise.</p>
          </div>
        `
      };
    case 'startup_rejected':
      return {
        subject: `Startup Registration Update - ${startupName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ef4444;">Startup Registration Not Approved</h1>
            <p><strong>${startupName}</strong> could not be approved.</p>
            <p><strong>Reason:</strong> ${reason || 'Does not meet our current listing criteria.'}</p>
          </div>
        `
      };
    case 'ipo_registration':
      return {
        subject: `IPO Registration Submitted - ${companyName || params.data?.company_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6366f1;">IPO Registration Received</h1>
            <p>Your IPO registration for <strong>${companyName || params.data?.company_name} (${symbol || params.data?.symbol})</strong> has been submitted successfully.</p>
          </div>
        `
      };
    case 'ipo_approved':
      return {
        subject: `IPO Approved - ${companyName} is Now Live!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">IPO Approved!</h1>
            <p>The IPO for <strong>${companyName} (${symbol})</strong> has been approved and is now live.</p>
          </div>
        `
      };
    case 'ipo_rejected':
      return {
        subject: `IPO Registration Update - ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ef4444;">IPO Registration Not Approved</h1>
            <p><strong>${companyName}</strong> could not be approved.</p>
            <p><strong>Reason:</strong> ${reason || 'Does not meet our current listing criteria.'}</p>
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
            <p>Your payment of ₹${params.data?.amount?.toLocaleString() || '0'} for <strong>${params.data?.courseName || 'N/A'}</strong> has been processed.</p>
            <p>You now have full access to the course content.</p>
          </div>
        `
      };
    case 'investment_confirmation':
      return {
        subject: `Investment Confirmed - ${params.data?.startupName || 'Startup Investment'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">Investment Confirmed! 🚀</h1>
            <p>Dear ${name || 'Investor'},</p>
            <p>Your investment of ₹${params.data?.amount?.toLocaleString() || '0'} in <strong>${params.data?.startupName || 'N/A'}</strong> has been confirmed.</p>
            <p>Track your investment in your portfolio.</p>
          </div>
        `
      };
    case 'meeting_scheduled':
      return {
        subject: `Meeting Scheduled - ${params.data?.topic || 'Investor Consultation'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6366f1;">Meeting Scheduled 📅</h1>
            <p>Dear ${name || 'User'},</p>
            <p>Your meeting <strong>"${params.data?.topic || 'Consultation'}"</strong> has been scheduled.</p>
            <p><strong>Date:</strong> ${params.data?.scheduledAt || 'TBD'}</p>
            <p>You will receive a meeting link before the scheduled time.</p>
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

    const body: EmailRequest = await req.json();
    const { to, email, type } = body;
    
    const recipientEmail = to || email;
    
    if (!recipientEmail) {
      console.log("No recipient email provided, skipping email send");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
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
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
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
