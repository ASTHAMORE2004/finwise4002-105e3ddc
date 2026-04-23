// Pure-JS stock prediction utilities — linear regression + simple moving average
// Trained on historical close prices fetched from the IBEX dataset.

export interface PricePoint {
  date: string; // ISO YYYY-MM-DD
  close: number;
}

export interface PredictionResult {
  forecast: PricePoint[];
  cagr: number;          // historical compound annual growth rate (decimal, e.g. 0.072)
  volatility: number;    // annualized stdev of daily returns
  trendSlope: number;    // slope of linear regression (price units per day)
  rSquared: number;      // model goodness of fit 0..1
  recentSMA20: number;
  recentSMA50: number;
  signal: "bullish" | "bearish" | "neutral";
  predictedReturnPct: number; // expected % return over horizon
}

// Linear regression y = a + b*x
function linreg(xs: number[], ys: number[]) {
  const n = xs.length;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0, sst = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
    sst += (ys[i] - my) ** 2;
  }
  const b = den === 0 ? 0 : num / den;
  const a = my - b * mx;
  let ssr = 0;
  for (let i = 0; i < n; i++) ssr += (ys[i] - (a + b * xs[i])) ** 2;
  const r2 = sst === 0 ? 0 : Math.max(0, 1 - ssr / sst);
  return { a, b, r2 };
}

function sma(arr: number[], window: number) {
  if (arr.length < window) return arr[arr.length - 1] ?? 0;
  const slice = arr.slice(-window);
  return slice.reduce((s, v) => s + v, 0) / slice.length;
}

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function predictPrices(
  history: PricePoint[],
  horizonDays: number = 90
): PredictionResult {
  if (history.length < 30) {
    return {
      forecast: [],
      cagr: 0, volatility: 0, trendSlope: 0, rSquared: 0,
      recentSMA20: 0, recentSMA50: 0, signal: "neutral", predictedReturnPct: 0,
    };
  }

  const closes = history.map((h) => h.close);
  const xs = history.map((_, i) => i);

  // Use last 2 years (~504 trading days) for trend stability
  const lookback = Math.min(closes.length, 504);
  const slice = closes.slice(-lookback);
  const sliceX = xs.slice(-lookback).map((x) => x - xs[xs.length - lookback]);

  const { a, b, r2 } = linreg(sliceX, slice);

  // Daily log returns -> CAGR & volatility
  const rets: number[] = [];
  for (let i = 1; i < slice.length; i++) {
    if (slice[i - 1] > 0) rets.push(Math.log(slice[i] / slice[i - 1]));
  }
  const meanRet = rets.reduce((s, v) => s + v, 0) / rets.length;
  const variance = rets.reduce((s, v) => s + (v - meanRet) ** 2, 0) / rets.length;
  const dailyVol = Math.sqrt(variance);
  const annualVol = dailyVol * Math.sqrt(252);
  const cagr = Math.exp(meanRet * 252) - 1;

  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const lastClose = closes[closes.length - 1];

  // Combine linear-regression projection with mean-return drift
  const forecast: PricePoint[] = [];
  const lastDate = history[history.length - 1].date;
  const lastX = sliceX[sliceX.length - 1];
  for (let d = 1; d <= horizonDays; d++) {
    const linProj = a + b * (lastX + d);
    const driftProj = lastClose * Math.exp(meanRet * d);
    // 60% drift / 40% linear blend
    const blended = 0.6 * driftProj + 0.4 * linProj;
    forecast.push({ date: addDays(lastDate, d), close: Math.max(0, blended) });
  }

  const finalPrice = forecast[forecast.length - 1]?.close ?? lastClose;
  const predictedReturnPct = ((finalPrice - lastClose) / lastClose) * 100;

  let signal: "bullish" | "bearish" | "neutral" = "neutral";
  if (sma20 > sma50 * 1.01 && b > 0) signal = "bullish";
  else if (sma20 < sma50 * 0.99 && b < 0) signal = "bearish";

  return {
    forecast,
    cagr,
    volatility: annualVol,
    trendSlope: b,
    rSquared: r2,
    recentSMA20: sma20,
    recentSMA50: sma50,
    signal,
    predictedReturnPct,
  };
}

// Time to reach a target amount given monthly contribution + expected annual return
export function timeToGoalYears(
  current: number,
  target: number,
  monthly: number,
  annualReturn: number
): number {
  if (current >= target) return 0;
  const r = annualReturn / 12;
  if (monthly <= 0) {
    if (annualReturn <= 0 || current <= 0) return Infinity;
    return Math.log(target / current) / Math.log(1 + annualReturn);
  }
  if (r === 0) return (target - current) / monthly / 12;
  // FV = current*(1+r)^n + monthly*((1+r)^n - 1)/r ; solve for n (months)
  const numerator = target * r + monthly;
  const denominator = current * r + monthly;
  if (denominator <= 0 || numerator / denominator <= 0) return Infinity;
  const n = Math.log(numerator / denominator) / Math.log(1 + r);
  return n / 12;
}

// Required monthly contribution to hit target by deadline
export function requiredMonthly(
  current: number,
  target: number,
  years: number,
  annualReturn: number
): number {
  if (years <= 0) return Math.max(0, target - current);
  const n = years * 12;
  const r = annualReturn / 12;
  if (r === 0) return Math.max(0, (target - current) / n);
  const fvCurrent = current * Math.pow(1 + r, n);
  const remaining = target - fvCurrent;
  if (remaining <= 0) return 0;
  return (remaining * r) / (Math.pow(1 + r, n) - 1);
}
