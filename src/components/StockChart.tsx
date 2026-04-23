import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend, CartesianGrid, Area, ComposedChart } from "recharts";
import { useMemo } from "react";
import type { PricePoint, PredictionResult } from "@/lib/stockPrediction";

interface Props {
  history: PricePoint[];
  prediction?: PredictionResult;
  height?: number;
}

export const StockChart = ({ history, prediction, height = 300 }: Props) => {
  const data = useMemo(() => {
    const hist = history.slice(-365).map((p) => ({ date: p.date, historical: p.close, forecast: null as number | null }));
    if (prediction?.forecast.length) {
      const lastHist = hist[hist.length - 1];
      const fc = prediction.forecast.map((p) => ({ date: p.date, historical: null as number | null, forecast: p.close }));
      if (lastHist) fc.unshift({ date: lastHist.date, historical: null, forecast: lastHist.historical });
      return [...hist, ...fc];
    }
    return hist;
  }, [history, prediction]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(d) => d.slice(0, 7)} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
          formatter={(v: any) => v ? Number(v).toFixed(2) : "—"}
        />
        <Legend />
        <Line type="monotone" dataKey="historical" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Historical" connectNulls />
        <Line type="monotone" dataKey="forecast" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="6 4" dot={false} name="Forecast" connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
