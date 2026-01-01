-- User Watchlist for tracking IPOs and Startups
CREATE TABLE public.user_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('ipo', 'startup')),
  item_id UUID NOT NULL,
  price_alert_low NUMERIC,
  price_alert_high NUMERIC,
  alert_enabled BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- Portfolio tracking for investments
CREATE TABLE public.user_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  investment_type TEXT NOT NULL CHECK (investment_type IN ('ipo', 'startup', 'mutual_fund', 'stock')),
  investment_id UUID,
  investment_name TEXT NOT NULL,
  symbol TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  buy_price NUMERIC NOT NULL,
  current_price NUMERIC,
  invested_amount NUMERIC NOT NULL,
  current_value NUMERIC,
  sector TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending')),
  sold_price NUMERIC,
  sold_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Market trends and analytics data
CREATE TABLE public.market_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sector TEXT NOT NULL,
  total_investment NUMERIC DEFAULT 0,
  avg_return_percent NUMERIC DEFAULT 0,
  top_performer_id UUID,
  top_performer_name TEXT,
  top_performer_return NUMERIC,
  total_ipos INTEGER DEFAULT 0,
  total_startups INTEGER DEFAULT 0,
  risk_score NUMERIC DEFAULT 5 CHECK (risk_score >= 1 AND risk_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trend_date, sector)
);

-- Price alerts history
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('ipo', 'startup')),
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('above', 'below', 'target_reached')),
  target_price NUMERIC NOT NULL,
  triggered_price NUMERIC,
  triggered_at TIMESTAMP WITH TIME ZONE,
  is_triggered BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Investment calculator saved calculations
CREATE TABLE public.saved_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('sip', 'lumpsum', 'compound_interest', 'returns')),
  name TEXT NOT NULL,
  inputs JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_calculations ENABLE ROW LEVEL SECURITY;

-- Watchlist policies
CREATE POLICY "Users can view their own watchlist" ON public.user_watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own watchlist items" ON public.user_watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own watchlist" ON public.user_watchlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own watchlist items" ON public.user_watchlist FOR DELETE USING (auth.uid() = user_id);

-- Portfolio policies
CREATE POLICY "Users can view their own portfolio" ON public.user_portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create portfolio entries" ON public.user_portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolio" ON public.user_portfolio FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete portfolio entries" ON public.user_portfolio FOR DELETE USING (auth.uid() = user_id);

-- Market trends policies (public read)
CREATE POLICY "Anyone can view market trends" ON public.market_trends FOR SELECT USING (true);
CREATE POLICY "Admins can manage market trends" ON public.market_trends FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Price alerts policies
CREATE POLICY "Users can view their own alerts" ON public.price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create alerts" ON public.price_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.price_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.price_alerts FOR DELETE USING (auth.uid() = user_id);

-- Saved calculations policies
CREATE POLICY "Users can view their own calculations" ON public.saved_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create calculations" ON public.saved_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calculations" ON public.saved_calculations FOR DELETE USING (auth.uid() = user_id);

-- Trigger for portfolio updated_at
CREATE TRIGGER update_portfolio_updated_at
  BEFORE UPDATE ON public.user_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();