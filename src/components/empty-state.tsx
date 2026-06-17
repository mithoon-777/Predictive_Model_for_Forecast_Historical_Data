import { Link } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title = "No dataset yet",
  description = "Upload a CSV to start exploring predictions and forecasts.",
  ctaLabel = "Upload CSV",
  ctaTo = "/upload",
}: {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaTo?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary shadow-elegant">
        <Upload className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild>
        <Link to={ctaTo}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
