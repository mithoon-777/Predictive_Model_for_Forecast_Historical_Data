export interface Metrics {
  r2: number;
  mae: number;
  mse: number;
  rmse: number;
}

export function computeMetrics(actual: number[], predicted: number[]): Metrics {
  const n = actual.length;
  if (n === 0) return { r2: 0, mae: 0, mse: 0, rmse: 0 };
  const mean = actual.reduce((a, b) => a + b, 0) / n;
  let ssRes = 0, ssTot = 0, mae = 0;
  for (let i = 0; i < n; i++) {
    const e = actual[i] - predicted[i];
    ssRes += e * e;
    mae += Math.abs(e);
    ssTot += (actual[i] - mean) ** 2;
  }
  const mse = ssRes / n;
  return {
    r2: ssTot === 0 ? 0 : 1 - ssRes / ssTot,
    mae: mae / n,
    mse,
    rmse: Math.sqrt(mse),
  };
}
