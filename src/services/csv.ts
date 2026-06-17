import Papa from "papaparse";

export type ColumnType = "number" | "date" | "string";

export interface Dataset {
  columns: string[];
  types: Record<string, ColumnType>;
  rows: Record<string, string | number | null>[];
  fileName: string;
}

function detectType(values: (string | null | undefined)[]): ColumnType {
  let num = 0, date = 0, total = 0;
  for (const v of values) {
    if (v === null || v === undefined || v === "") continue;
    total++;
    const s = String(v).trim();
    if (!isNaN(Number(s)) && s !== "") num++;
    else if (!isNaN(Date.parse(s))) date++;
  }
  if (total === 0) return "string";
  if (num / total > 0.8) return "number";
  if (date / total > 0.8) return "date";
  return "string";
}

export function parseCsv(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const columns = result.meta.fields ?? [];
        const types: Record<string, ColumnType> = {};
        for (const c of columns) {
          types[c] = detectType(result.data.map((r) => r[c]));
        }
        const rows = result.data.map((r) => {
          const out: Record<string, string | number | null> = {};
          for (const c of columns) {
            const raw = r[c];
            if (raw === undefined || raw === null || raw === "") {
              out[c] = null;
            } else if (types[c] === "number") {
              const n = Number(raw);
              out[c] = isNaN(n) ? null : n;
            } else {
              out[c] = String(raw);
            }
          }
          return out;
        });
        resolve({ columns, types, rows, fileName: file.name });
      },
      error: reject,
    });
  });
}

export function toCsv(rows: Record<string, unknown>[]): string {
  return Papa.unparse(rows);
}
