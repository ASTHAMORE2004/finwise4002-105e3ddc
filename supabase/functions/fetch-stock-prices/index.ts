import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Free stock data using Yahoo Finance API (via RapidAPI alternative approach)
// We'll use a public endpoint that doesn't require API key for basic data
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json();

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: "Symbols array is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch stock data for each symbol
    const stockData: Record<string, any> = {};
    
    for (const symbol of symbols) {
      try {
        // Using Yahoo Finance public API
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1d`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const result = data.chart?.result?.[0];
          
          if (result) {
            const meta = result.meta;
            const quote = result.indicators?.quote?.[0];
            
            stockData[symbol] = {
              symbol,
              regularMarketPrice: meta.regularMarketPrice || null,
              previousClose: meta.chartPreviousClose || meta.previousClose || null,
              change: meta.regularMarketPrice && meta.chartPreviousClose 
                ? meta.regularMarketPrice - meta.chartPreviousClose 
                : null,
              changePercent: meta.regularMarketPrice && meta.chartPreviousClose 
                ? ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100 
                : null,
              high: quote?.high?.[0] || meta.regularMarketDayHigh || null,
              low: quote?.low?.[0] || meta.regularMarketDayLow || null,
              volume: quote?.volume?.[0] || meta.regularMarketVolume || null,
              currency: meta.currency || "INR",
              exchange: meta.exchangeName || "NSE",
              timestamp: new Date().toISOString(),
            };
          }
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        stockData[symbol] = {
          symbol,
          error: "Failed to fetch data",
          timestamp: new Date().toISOString(),
        };
      }
    }

    return new Response(
      JSON.stringify({ data: stockData, fetchedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Stock fetch error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
