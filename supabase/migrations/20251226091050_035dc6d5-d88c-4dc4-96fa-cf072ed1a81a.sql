-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies for documents bucket
CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- KYC Documents table
CREATE TABLE public.kyc_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL, -- 'aadhaar', 'pan', 'passport', 'driving_license'
  document_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own KYC" ON public.kyc_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own KYC" ON public.kyc_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own KYC" ON public.kyc_documents FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_kyc_documents_updated_at
BEFORE UPDATE ON public.kyc_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Startup IPO Registrations table
CREATE TABLE public.startup_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  startup_name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT,
  sector TEXT,
  funding_goal NUMERIC NOT NULL,
  raised_amount NUMERIC DEFAULT 0,
  pitch_video_url TEXT,
  pitch_deck_url TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'live', 'funded', 'rejected'
  min_investment NUMERIC DEFAULT 1000,
  equity_offered NUMERIC, -- percentage
  valuation NUMERIC,
  team_size INTEGER,
  founded_year INTEGER,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.startup_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved startups" ON public.startup_registrations FOR SELECT USING (status IN ('approved', 'live', 'funded') OR auth.uid() = user_id);
CREATE POLICY "Users can create their own startup" ON public.startup_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own startup" ON public.startup_registrations FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_startup_registrations_updated_at
BEFORE UPDATE ON public.startup_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Startup Investments table
CREATE TABLE public.startup_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  startup_id UUID NOT NULL REFERENCES public.startup_registrations(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.startup_investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own investments" ON public.startup_investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own investments" ON public.startup_investments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Course payments table
CREATE TABLE public.course_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_id TEXT,
  order_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.course_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON public.course_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own payments" ON public.course_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payments" ON public.course_payments FOR UPDATE USING (auth.uid() = user_id);

-- OTP verifications table
CREATE TABLE public.otp_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  purpose TEXT NOT NULL, -- 'signup', 'login', 'password_reset'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own OTPs" ON public.otp_verifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anyone can create OTP" ON public.otp_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own OTPs" ON public.otp_verifications FOR UPDATE USING (true);

-- Investor meetings table
CREATE TABLE public.investor_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID REFERENCES public.startup_registrations(id) ON DELETE CASCADE,
  host_user_id UUID NOT NULL,
  investor_user_id UUID,
  room_url TEXT,
  room_name TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  meeting_type TEXT DEFAULT 'pitch', -- 'pitch', 'follow_up', 'due_diligence'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.investor_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meetings" ON public.investor_meetings FOR SELECT USING (auth.uid() = host_user_id OR auth.uid() = investor_user_id);
CREATE POLICY "Users can create meetings" ON public.investor_meetings FOR INSERT WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "Users can update their meetings" ON public.investor_meetings FOR UPDATE USING (auth.uid() = host_user_id);

-- Add price and youtube_url columns to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS youtube_playlist_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;

-- Add youtube_url to lessons
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS youtube_url TEXT;