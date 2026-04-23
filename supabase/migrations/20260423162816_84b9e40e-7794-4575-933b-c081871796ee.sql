DROP POLICY IF EXISTS "temp seed index" ON public.market_index_history;
DROP POLICY IF EXISTS "temp seed stocks" ON public.stock_prices;
REVOKE INSERT ON public.market_index_history FROM authenticator, anon, authenticated, sandbox_exec;
REVOKE INSERT ON public.stock_prices FROM authenticator, anon, authenticated, sandbox_exec;
REVOKE USAGE ON SEQUENCE public.market_index_history_id_seq FROM authenticator, anon, authenticated, sandbox_exec;
REVOKE USAGE ON SEQUENCE public.stock_prices_id_seq FROM authenticator, anon, authenticated, sandbox_exec;