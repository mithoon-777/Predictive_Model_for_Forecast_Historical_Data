import { trainLinear, predictLinear } from "./linear";

export interface TimeSeriesModel {
  kind: "timeseries";
  intercept: number;
  slope: number;
  startTime: number;
  step: number; // ms between observations (median)
  windowMA: number;
}

export interface TSPoint {
  t: number; // timestamp ms
  y: number;
}

export function trainTimeSeries(points: TSPoint[], windowMA = 3): TimeSeriesModel {
  const sorted = [...points].sort((a, b) => a.t - b.t);
  const startTime = sorted[0]?.t ?? 0;
  // Median step
  const diffs: number[] = [];
  for (let i = 1; i < sorted.length; i++) diffs.push(sorted[i].t - sorted[i - 1].t);
  diffs.sort((a, b) => a - b);
  const step = diffs.length ? diffs[Math.floor(diffs.length / 2)] : 86400000;
  // Fit linear trend on index
  const X = sorted.map((_, i) => [i]);
  const y = sorted.map((p) => p.y);
  const lm = trainLinear(X, y);
  return {
    kind: "timeseries",
    intercept: lm.coefficients[0],
    slope: lm.coefficients[1],
    startTime,
    step,
    windowMA,
  };
}

export function predictTimeSeriesIndex(model: TimeSeriesModel, indices: number[]): number[] {
  return predictLinear(
    { kind: "linear", coefficients: [model.intercept, model.slope] },
    indices.map((i) => [i])
  );
}

export function forecastFuture(model: TimeSeriesModel, lastIndex: number, horizon: number) {
  const idx: number[] = [];
  const ts: number[] = [];
  for (let i = 1; i <= horizon; i++) {
    idx.push(lastIndex + i);
    ts.push(model.startTime + (lastIndex + i) * model.step);
  }
  const y = predictTimeSeriesIndex(model, idx);
  return ts.map((t, i) => ({ t, y: y[i] }));
}
