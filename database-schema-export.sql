-- =============================================
-- COMPLETE DATABASE SCHEMA EXPORT
-- Generated from Lovable Cloud
-- =============================================

-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- =============================================
-- TABLES
-- =============================================

-- Profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  phone text,
  avatar_url text,
  email_verified boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Courses table
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  youtube_playlist_url text,
  category text,
  difficulty text DEFAULT 'beginner',
  duration_hours integer DEFAULT 0,
  lessons_count integer DEFAULT 0,
  is_paid boolean DEFAULT false,
  price numeric DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Lessons table
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id),
  title text NOT NULL,
  description text,
  video_url text,
  youtube_url text,
  duration_minutes integer DEFAULT 0,
  order_index integer DEFAULT 0,
  is_free boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Course payments table
CREATE TABLE public.course_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'INR',
  payment_id text,
  order_id text,
  payment_status text DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User course progress table
CREATE TABLE public.user_course_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  lesson_id uuid,
  progress_percent integer DEFAULT 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- IPO listings table
CREATE TABLE public.ipo_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL,
  symbol text NOT NULL,
  description text,
  sector text,
  logo_url text,
  price_band_low numeric NOT NULL,
  price_band_high numeric NOT NULL,
  lot_size integer NOT NULL,
  issue_size numeric,
  issue_type text DEFAULT 'Book Built',
  open_date date NOT NULL,
  close_date date NOT NULL,
  listing_date date,
  subscription_rate numeric DEFAULT 0,
  status text DEFAULT 'upcoming',
  prospectus_url text,
  rejection_reason text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- IPO applications table
CREATE TABLE public.ipo_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  ipo_id uuid NOT NULL,
  lots_applied integer NOT NULL,
  bid_price numeric NOT NULL,
  amount numeric NOT NULL,
  upi_id text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Startup registrations table
CREATE TABLE public.startup_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  startup_name text NOT NULL,
  symbol text NOT NULL,
  description text,
  sector text,
  logo_url text,
  pitch_deck_url text,
  pitch_video_url text,
  website_url text,
  founded_year integer,
  team_size integer,
  valuation numeric,
  funding_goal numeric NOT NULL,
  raised_amount numeric DEFAULT 0,
  equity_offered numeric,
  min_investment numeric DEFAULT 1000,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Startup investments table
CREATE TABLE public.startup_investments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  startup_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_id text,
  payment_status text DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User portfolio table
CREATE TABLE public.user_portfolio (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  investment_id uuid,
  investment_type text NOT NULL,
  investment_name text NOT NULL,
  symbol text,
  sector text,
  quantity numeric NOT NULL DEFAULT 0,
  buy_price numeric NOT NULL,
  invested_amount numeric NOT NULL,
  current_price numeric,
  current_value numeric,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  sold_date date,
  sold_price numeric,
  status text DEFAULT 'active',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User watchlist table
CREATE TABLE public.user_watchlist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_id uuid NOT NULL,
  item_type text NOT NULL,
  notes text,
  alert_enabled boolean DEFAULT false,
  price_alert_low numeric,
  price_alert_high numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Price alerts table
CREATE TABLE public.price_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_id uuid NOT NULL,
  item_type text NOT NULL,
  item_name text NOT NULL,
  target_price numeric NOT NULL,
  alert_type text NOT NULL,
  is_triggered boolean DEFAULT false,
  triggered_at timestamp with time zone,
  triggered_price numeric,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Market trends table
CREATE TABLE public.market_trends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_date date NOT NULL DEFAULT CURRENT_DATE,
  sector text NOT NULL,
  total_investment numeric DEFAULT 0,
  total_startups integer DEFAULT 0,
  total_ipos integer DEFAULT 0,
  avg_return_percent numeric DEFAULT 0,
  risk_score numeric DEFAULT 5,
  top_performer_id uuid,
  top_performer_name text,
  top_performer_return numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Investor meetings table
CREATE TABLE public.investor_meetings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_user_id uuid NOT NULL,
  investor_user_id uuid,
  startup_id uuid,
  room_name text,
  room_url text,
  meeting_type text DEFAULT 'pitch',
  status text DEFAULT 'scheduled',
  scheduled_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Video sessions table
CREATE TABLE public.video_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_user_id uuid NOT NULL,
  participant_user_id uuid,
  room_id text NOT NULL,
  topic text,
  status text DEFAULT 'scheduled',
  scheduled_at timestamp with time zone,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Saved calculations table
CREATE TABLE public.saved_calculations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  calculation_type text NOT NULL,
  inputs jsonb NOT NULL,
  result jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- KYC documents table
CREATE TABLE public.kyc_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  document_type text NOT NULL,
  document_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  verified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- OTP verifications table
CREATE TABLE public.otp_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  email text NOT NULL,
  otp_code text NOT NULL,
  purpose text NOT NULL,
  verified boolean DEFAULT false,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Courses policies
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

-- Lessons policies
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);

-- Course payments policies
CREATE POLICY "Users can view their own payments" ON public.course_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own payments" ON public.course_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payments" ON public.course_payments FOR UPDATE USING (auth.uid() = user_id);

-- User course progress policies
CREATE POLICY "Users can view their own progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_course_progress FOR UPDATE USING (auth.uid() = user_id);

-- IPO listings policies
CREATE POLICY "Anyone can view IPO listings" ON public.ipo_listings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create IPO listings" ON public.ipo_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update all IPO listings" ON public.ipo_listings FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- IPO applications policies
CREATE POLICY "Users can view their own applications" ON public.ipo_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own applications" ON public.ipo_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON public.ipo_applications FOR UPDATE USING (auth.uid() = user_id);

-- Startup registrations policies
CREATE POLICY "View startups based on status or ownership" ON public.startup_registrations FOR SELECT USING ((status = ANY (ARRAY['approved', 'live', 'funded'])) OR (auth.uid() = user_id) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create their own startup" ON public.startup_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own startup" ON public.startup_registrations FOR UPDATE USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'));

-- Startup investments policies
CREATE POLICY "Users can view their own investments" ON public.startup_investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own investments" ON public.startup_investments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User portfolio policies
CREATE POLICY "Users can view their own portfolio" ON public.user_portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create portfolio entries" ON public.user_portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolio" ON public.user_portfolio FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete portfolio entries" ON public.user_portfolio FOR DELETE USING (auth.uid() = user_id);

-- User watchlist policies
CREATE POLICY "Users can view their own watchlist" ON public.user_watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own watchlist items" ON public.user_watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own watchlist" ON public.user_watchlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own watchlist items" ON public.user_watchlist FOR DELETE USING (auth.uid() = user_id);

-- Price alerts policies
CREATE POLICY "Users can view their own alerts" ON public.price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create alerts" ON public.price_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.price_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.price_alerts FOR DELETE USING (auth.uid() = user_id);

-- Market trends policies
CREATE POLICY "Anyone can view market trends" ON public.market_trends FOR SELECT USING (true);
CREATE POLICY "Admins can manage market trends" ON public.market_trends FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Investor meetings policies
CREATE POLICY "Users can view their meetings" ON public.investor_meetings FOR SELECT USING ((auth.uid() = host_user_id) OR (auth.uid() = investor_user_id));
CREATE POLICY "Users can create meetings" ON public.investor_meetings FOR INSERT WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "Users can update their meetings" ON public.investor_meetings FOR UPDATE USING (auth.uid() = host_user_id);

-- Video sessions policies
CREATE POLICY "Users can view sessions they're part of" ON public.video_sessions FOR SELECT USING ((auth.uid() = host_user_id) OR (auth.uid() = participant_user_id));
CREATE POLICY "Users can create sessions as host" ON public.video_sessions FOR INSERT WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "Hosts can update their sessions" ON public.video_sessions FOR UPDATE USING (auth.uid() = host_user_id);

-- Saved calculations policies
CREATE POLICY "Users can view their own calculations" ON public.saved_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create calculations" ON public.saved_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calculations" ON public.saved_calculations FOR DELETE USING (auth.uid() = user_id);

-- KYC documents policies
CREATE POLICY "Users can view their own KYC" ON public.kyc_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own KYC" ON public.kyc_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own KYC documents" ON public.kyc_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own KYC" ON public.kyc_documents FOR UPDATE USING (auth.uid() = user_id);

-- OTP verifications policies
CREATE POLICY "Users can view their own OTPs" ON public.otp_verifications FOR SELECT USING ((auth.uid() = user_id) OR (user_id IS NULL));
CREATE POLICY "Anyone can create OTP" ON public.otp_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own OTPs" ON public.otp_verifications FOR UPDATE USING (true);

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_course_progress_updated_at BEFORE UPDATE ON public.user_course_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ipo_listings_updated_at BEFORE UPDATE ON public.ipo_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ipo_applications_updated_at BEFORE UPDATE ON public.ipo_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_startup_registrations_updated_at BEFORE UPDATE ON public.startup_registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_portfolio_updated_at BEFORE UPDATE ON public.user_portfolio FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON public.kyc_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create documents bucket (run in Supabase dashboard or via API)
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- =============================================
-- USAGE INSTRUCTIONS
-- =============================================
-- 1. Create a new Supabase project at https://supabase.com
-- 2. Go to SQL Editor in your Supabase dashboard
-- 3. Run this entire SQL file
-- 4. Update your .env file with your new Supabase URL and anon key
-- 5. Configure email templates in Authentication > Email Templates
