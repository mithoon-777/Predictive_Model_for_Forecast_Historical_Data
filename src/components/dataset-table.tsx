import type { Dataset } from "@/services/csv";
import { cn } from "@/lib/utils";

export function DatasetTable({ data, maxRows = 50 }: { data: Dataset; maxRows?: number }) {
  const rows = data.rows.slice(0, maxRows);
  return (
    <div className="overflow-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted/60 backdrop-blur">
          <tr>
            {data.columns.map((c) => (
              <th key={c} className="whitespace-nowrap px-3 py-2 text-left font-medium">
                <div className="flex flex-col">
                  <span>{c}</span>
                  <span className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                    {data.types[c]}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={cn("border-t border-border", i % 2 && "bg-muted/20")}>
              {data.columns.map((c) => (
                <td key={c} className="whitespace-nowrap px-3 py-1.5 tabular-nums">
                  {r[c] === null ? <span className="text-muted-foreground/60">—</span> : String(r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.rows.length > maxRows && (
        <div className="border-t border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Showing {maxRows} of {data.rows.length.toLocaleString()} rows
        </div>
      )}
    </div>
  );
}
