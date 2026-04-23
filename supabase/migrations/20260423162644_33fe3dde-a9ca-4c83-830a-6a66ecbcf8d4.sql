CREATE TABLE public.market_index_history (
  id BIGSERIAL PRIMARY KEY,
  index_symbol TEXT NOT NULL DEFAULT 'IBEX',
  trade_date DATE NOT NULL,
  open NUMERIC,
  high NUMERIC,
  low NUMERIC,
  close NUMERIC NOT NULL,
  adj_close NUMERIC,
  volume BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(index_symbol, trade_date)
);
CREATE INDEX idx_market_index_date ON public.market_index_history(trade_date);
ALTER TABLE public.market_index_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view index history" ON public.market_index_history FOR SELECT USING (true);
CREATE POLICY "Admins manage index history" ON public.market_index_history FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.stock_prices (
  id BIGSERIAL PRIMARY KEY,
  ticker TEXT NOT NULL,
  trade_date DATE NOT NULL,
  open NUMERIC,
  high NUMERIC,
  low NUMERIC,
  close NUMERIC NOT NULL,
  adj_close NUMERIC,
  volume BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ticker, trade_date)
);
CREATE INDEX idx_stock_prices_ticker_date ON public.stock_prices(ticker, trade_date);
CREATE INDEX idx_stock_prices_date ON public.stock_prices(trade_date);
ALTER TABLE public.stock_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view stock prices" ON public.stock_prices FOR SELECT USING (true);
CREATE POLICY "Admins manage stock prices" ON public.stock_prices FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.financial_goals ADD COLUMN IF NOT EXISTS linked_ticker TEXT;
ALTER TABLE public.financial_goals ADD COLUMN IF NOT EXISTS expected_cagr NUMERIC;
ALTER TABLE public.financial_goals ADD COLUMN IF NOT EXISTS monthly_contribution NUMERIC DEFAULT 0;