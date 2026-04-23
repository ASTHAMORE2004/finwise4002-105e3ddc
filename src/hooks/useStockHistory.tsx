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
      let rows: any[] | null = null;
      let err: any = null;
      if (ticker === "IBEX") {
        const r = await supabase
          .from("market_index_history")
          .select("trade_date, close")
          .eq("index_symbol", "IBEX")
          .gte("trade_date", sinceStr)
          .order("trade_date", { ascending: true })
          .limit(2000);
        rows = r.data; err = r.error;
      } else {
        const r = await supabase
          .from("stock_prices")
          .select("trade_date, close")
          .eq("ticker", ticker)
          .gte("trade_date", sinceStr)
          .order("trade_date", { ascending: true })
          .limit(2000);
        rows = r.data; err = r.error;
      }
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
