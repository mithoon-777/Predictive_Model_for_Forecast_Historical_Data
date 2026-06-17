import { trainLinear, predictLinear, type LinearModel } from "./linear";

export interface PolyModel {
  kind: "polynomial";
  degree: number;
  inner: LinearModel;
}

function expand(X: number[][], degree: number): number[][] {
  // For each feature, append x^2 ... x^degree
  return X.map((row) => {
    const out: number[] = [];
    for (const x of row) for (let d = 1; d <= degree; d++) out.push(Math.pow(x, d));
    return out;
  });
}

export function trainPolynomial(X: number[][], y: number[], degree: number): PolyModel {
  const Xp = expand(X, degree);
  return { kind: "polynomial", degree, inner: trainLinear(Xp, y) };
}

export function predictPolynomial(model: PolyModel, X: number[][]): number[] {
  return predictLinear(model.inner, expand(X, model.degree));
}
