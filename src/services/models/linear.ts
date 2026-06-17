// OLS multiple linear regression via normal equations.
// Solves (Xᵀ X) β = Xᵀ y for β. Adds intercept automatically.

function transpose(m: number[][]): number[][] {
  const r = m.length, c = m[0].length;
  const out: number[][] = Array.from({ length: c }, () => new Array(r));
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) out[j][i] = m[i][j];
  return out;
}
function matmul(a: number[][], b: number[][]): number[][] {
  const r = a.length, n = a[0].length, c = b[0].length;
  const out: number[][] = Array.from({ length: r }, () => new Array(c).fill(0));
  for (let i = 0; i < r; i++)
    for (let k = 0; k < n; k++) {
      const aik = a[i][k];
      for (let j = 0; j < c; j++) out[i][j] += aik * b[k][j];
    }
  return out;
}
// Solve Ax = b via Gauss–Jordan with partial pivoting; A is n×n, b is n×1
function solve(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[pivot][i])) pivot = r;
    [M[i], M[pivot]] = [M[pivot], M[i]];
    const div = M[i][i] || 1e-12;
    for (let j = i; j <= n; j++) M[i][j] /= div;
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const f = M[r][i];
      for (let j = i; j <= n; j++) M[r][j] -= f * M[i][j];
    }
  }
  return M.map((row) => row[n]);
}

export interface LinearModel {
  kind: "linear";
  coefficients: number[]; // [intercept, β1, β2, ...]
}

export function trainLinear(X: number[][], y: number[]): LinearModel {
  const Xb = X.map((row) => [1, ...row]);
  const Xt = transpose(Xb);
  const XtX = matmul(Xt, Xb);
  const Xty = matmul(Xt, y.map((v) => [v])).map((r) => r[0]);
  // Ridge regularization for stability
  for (let i = 0; i < XtX.length; i++) XtX[i][i] += 1e-8;
  const beta = solve(XtX, Xty);
  return { kind: "linear", coefficients: beta };
}

export function predictLinear(model: LinearModel, X: number[][]): number[] {
  return X.map((row) => {
    let y = model.coefficients[0];
    for (let i = 0; i < row.length; i++) y += model.coefficients[i + 1] * row[i];
    return y;
  });
}
