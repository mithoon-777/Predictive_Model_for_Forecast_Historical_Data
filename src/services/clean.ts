import type { Dataset } from "./csv";

export type MissingStrategy = "drop" | "mean" | "median" | "zero";
export type ScaleMethod = "none" | "minmax" | "zscore";

export interface CleanConfig {
  missing: MissingStrategy;
  dedupe: boolean;
  scale: ScaleMethod;
}

function mean(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function cleanDataset(ds: Dataset, cfg: CleanConfig): Dataset {
  let rows = ds.rows.map((r) => ({ ...r }));

  // Missing values
  if (cfg.missing === "drop") {
    rows = rows.filter((r) => ds.columns.every((c) => r[c] !== null));
  } else {
    for (const c of ds.columns) {
      if (ds.types[c] !== "number") continue;
      const nums = rows.map((r) => r[c]).filter((v): v is number => typeof v === "number");
      if (nums.length === 0) continue;
      const fill =
        cfg.missing === "mean" ? mean(nums) :
        cfg.missing === "median" ? median(nums) : 0;
      for (const r of rows) if (r[c] === null) r[c] = fill;
    }
  }

  // Dedupe
  if (cfg.dedupe) {
    const seen = new Set<string>();
    rows = rows.filter((r) => {
      const key = JSON.stringify(r);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Scaling (numeric cols only)
  if (cfg.scale !== "none") {
    for (const c of ds.columns) {
      if (ds.types[c] !== "number") continue;
      const nums = rows.map((r) => (typeof r[c] === "number" ? (r[c] as number) : NaN)).filter((n) => !isNaN(n));
      if (nums.length === 0) continue;
      if (cfg.scale === "minmax") {
        const mn = Math.min(...nums), mx = Math.max(...nums);
        const rng = mx - mn || 1;
        for (const r of rows) if (typeof r[c] === "number") r[c] = ((r[c] as number) - mn) / rng;
      } else {
        const m = mean(nums);
        const sd = Math.sqrt(mean(nums.map((n) => (n - m) ** 2))) || 1;
        for (const r of rows) if (typeof r[c] === "number") r[c] = ((r[c] as number) - m) / sd;
      }
    }
  }

  return { ...ds, rows };
}
