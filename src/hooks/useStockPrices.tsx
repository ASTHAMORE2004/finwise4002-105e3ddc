import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StockPrice {
  symbol: string;
  regularMarketPrice: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  currency: string;
  exchange: string;
  timestamp: string;
  error?: string;
}

interface UseStockPricesReturn {
  prices: Record<string, StockPrice>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useStockPrices = (symbols: string[], autoRefresh = true, refreshInterval = 60000): UseStockPricesReturn => {
  const [prices, setPrices] = useState<Record<string, StockPrice>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-stock-prices', {
        body: { symbols },
      });

      if (fnError) throw fnError;

      if (data?.data) {
        setPrices(data.data);
        setLastUpdated(new Date(data.fetchedAt));
      }
    } catch (err) {
      console.error('Error fetching stock prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock prices');
    } finally {
      setLoading(false);
    }
  }, [symbols.join(',')]);

  useEffect(() => {
    fetchPrices();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchPrices, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPrices, autoRefresh, refreshInterval]);

  return {
    prices,
    loading,
    error,
    refetch: fetchPrices,
    lastUpdated,
  };
};

export default useStockPrices;
