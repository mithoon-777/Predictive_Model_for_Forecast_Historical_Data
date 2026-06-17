export function trainTestSplit<T>(rows: T[], testRatio = 0.2, seed = 42): { train: T[]; test: T[] } {
  // Deterministic shuffle (mulberry32)
  let s = seed;
  const rand = () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const indexed = rows.map((r, i) => ({ r, k: rand() + i * 1e-12 }));
  indexed.sort((a, b) => a.k - b.k);
  const shuffled = indexed.map((x) => x.r);
  const cut = Math.max(1, Math.floor(shuffled.length * (1 - testRatio)));
  return { train: shuffled.slice(0, cut), test: shuffled.slice(cut) };
}
