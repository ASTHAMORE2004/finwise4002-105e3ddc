CREATE POLICY "temp seed index" ON public.market_index_history FOR INSERT WITH CHECK (true);
CREATE POLICY "temp seed stocks" ON public.stock_prices FOR INSERT WITH CHECK (true);
GRANT INSERT ON public.market_index_history TO authenticator, anon, authenticated;
GRANT INSERT ON public.stock_prices TO authenticator, anon, authenticated;
GRANT USAGE ON SEQUENCE public.market_index_history_id_seq TO authenticator, anon, authenticated;
GRANT USAGE ON SEQUENCE public.stock_prices_id_seq TO authenticator, anon, authenticated;