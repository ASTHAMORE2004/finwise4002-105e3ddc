import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PricePoint } from "@/lib/stockPrediction";

export const useStockHistory = (ticker: string, lookbackYears: number = 5) => {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!ticker) return;
    setLoading(true);
    const since = new Date();
    since.setFullYear(since.getFullYear() - lookbackYears);
    const sinceStr = since.toISOString().slice(0, 10);

    const fetchData = async () => {
      const table = ticker === "IBEX" ? "market_index_history" : "stock_prices";
      const query = supabase
        .from(table)
        .select("trade_date, close")
        .gte("trade_date", sinceStr)
        .order("trade_date", { ascending: true })
        .limit(2000);
      const filtered = ticker === "IBEX"
        ? query.eq("index_symbol", "IBEX")
        : query.eq("ticker", ticker);
      const { data: rows, error: err } = await filtered;
      if (!alive) return;
      if (err) { setError(err.message); setData([]); }
      else setData((rows || []).map((r: any) => ({ date: r.trade_date, close: Number(r.close) })));
      setLoading(false);
    };
    fetchData();
    return () => { alive = false; };
  }, [ticker, lookbackYears]);

  return { data, loading, error };
};
