-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration_hours INTEGER DEFAULT 0,
  lessons_count INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'beginner',
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user course progress table
CREATE TABLE public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  progress_percent INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create IPO listings table
CREATE TABLE public.ipo_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  logo_url TEXT,
  price_band_low DECIMAL(12,2) NOT NULL,
  price_band_high DECIMAL(12,2) NOT NULL,
  lot_size INTEGER NOT NULL,
  issue_size DECIMAL(15,2),
  issue_type TEXT DEFAULT 'Book Built',
  listing_date DATE,
  open_date DATE NOT NULL,
  close_date DATE NOT NULL,
  status TEXT DEFAULT 'upcoming',
  sector TEXT,
  description TEXT,
  prospectus_url TEXT,
  subscription_rate DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create IPO applications table
CREATE TABLE public.ipo_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ipo_id UUID NOT NULL REFERENCES public.ipo_listings(id) ON DELETE CASCADE,
  lots_applied INTEGER NOT NULL,
  bid_price DECIMAL(12,2) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  upi_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ipo_id)
);

-- Create video call sessions table
CREATE TABLE public.video_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  room_id TEXT NOT NULL UNIQUE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled',
  topic TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Courses policies (public read)
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

-- Lessons policies (public read)
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);

-- User course progress policies
CREATE POLICY "Users can view their own progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_course_progress FOR UPDATE USING (auth.uid() = user_id);

-- IPO listings policies (public read)
CREATE POLICY "Anyone can view IPO listings" ON public.ipo_listings FOR SELECT USING (true);

-- IPO applications policies
CREATE POLICY "Users can view their own applications" ON public.ipo_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own applications" ON public.ipo_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON public.ipo_applications FOR UPDATE USING (auth.uid() = user_id);

-- Video sessions policies
CREATE POLICY "Users can view sessions they're part of" ON public.video_sessions FOR SELECT USING (auth.uid() = host_user_id OR auth.uid() = participant_user_id);
CREATE POLICY "Users can create sessions as host" ON public.video_sessions FOR INSERT WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "Hosts can update their sessions" ON public.video_sessions FOR UPDATE USING (auth.uid() = host_user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_course_progress_updated_at BEFORE UPDATE ON public.user_course_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ipo_listings_updated_at BEFORE UPDATE ON public.ipo_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ipo_applications_updated_at BEFORE UPDATE ON public.ipo_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample courses
INSERT INTO public.courses (title, description, duration_hours, lessons_count, difficulty, category, is_featured) VALUES
('Stock Market Basics', 'Learn the fundamentals of stock market investing in India', 4, 12, 'beginner', 'Investing', true),
('Mutual Funds 101', 'Complete guide to mutual fund investing for beginners', 3, 10, 'beginner', 'Mutual Funds', true),
('Technical Analysis', 'Master chart patterns and technical indicators', 6, 18, 'intermediate', 'Trading', false),
('IPO Investing Guide', 'How to analyze and apply for IPOs in India', 2, 8, 'beginner', 'IPO', true),
('Tax Planning for Investors', 'Optimize your taxes on investment gains', 3, 10, 'intermediate', 'Tax', false),
('Portfolio Management', 'Build and manage a diversified investment portfolio', 5, 15, 'advanced', 'Investing', false);

-- Insert sample lessons for Stock Market Basics
INSERT INTO public.lessons (course_id, title, description, duration_minutes, order_index, is_free)
SELECT id, 'What is the Stock Market?', 'Introduction to stock markets and how they work', 15, 1, true FROM public.courses WHERE title = 'Stock Market Basics';
INSERT INTO public.lessons (course_id, title, description, duration_minutes, order_index, is_free)
SELECT id, 'Understanding NSE and BSE', 'Learn about Indian stock exchanges', 20, 2, true FROM public.courses WHERE title = 'Stock Market Basics';
INSERT INTO public.lessons (course_id, title, description, duration_minutes, order_index, is_free)
SELECT id, 'How to Open a Demat Account', 'Step-by-step guide to opening trading accounts', 18, 3, false FROM public.courses WHERE title = 'Stock Market Basics';
INSERT INTO public.lessons (course_id, title, description, duration_minutes, order_index, is_free)
SELECT id, 'Reading Stock Charts', 'Basic chart reading techniques', 25, 4, false FROM public.courses WHERE title = 'Stock Market Basics';

-- Insert sample IPO listings
INSERT INTO public.ipo_listings (company_name, symbol, price_band_low, price_band_high, lot_size, issue_size, sector, open_date, close_date, status, description) VALUES
('TechVentures India Ltd', 'TECHVENT', 420.00, 450.00, 33, 1200.00, 'Technology', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', 'upcoming', 'Leading tech solutions provider'),
('GreenEnergy Corp', 'GREENENR', 180.00, 195.00, 75, 800.00, 'Renewable Energy', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 'open', 'Solar and wind energy company'),
('HealthFirst Pharma', 'HFPHARMA', 550.00, 580.00, 25, 1500.00, 'Healthcare', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '2 days', 'closed', 'Generic medicines manufacturer'),
('FinServe Digital', 'FINSERV', 320.00, 345.00, 45, 950.00, 'Fintech', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '10 days', 'upcoming', 'Digital lending platform');