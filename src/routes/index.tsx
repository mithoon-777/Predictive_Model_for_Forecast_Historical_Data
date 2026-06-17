import { createFileRoute, Link } from "@tanstack/react-router";
import { useDatasetStore } from "@/store/dataset";
import { MetricCard } from "@/components/metric-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Layers, Target, TrendingUp, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Forecastr" },
      { name: "description", content: "Overview of your dataset, models, and forecasts." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { cleaned, modelConfig, result } = useDatasetStore();

  if (!cleaned) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-10">
        <Header />
        <EmptyState />
      </div>
    );
  }

  const numericCols = cleaned.columns.filter((c) => cleaned.types[c] === "number");
  const previewData = result?.historical?.slice(-30) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-10">
      <Header />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard
          label="Rows"
          value={cleaned.rows.length.toLocaleString()}
          icon={Database}
          hint={cleaned.fileName}
        />
        <MetricCard
          label="Columns"
          value={cleaned.columns.length}
          icon={Layers}
          hint={`${numericCols.length} numeric`}
        />
        <MetricCard
          label="Target"
          value={modelConfig.target || "—"}
          icon={Target}
          hint={modelConfig.target ? "Ready to train" : "Pick on Predict page"}
        />
        <MetricCard
          label="R² Score"
          value={result ? result.metrics.r2.toFixed(3) : "—"}
          icon={TrendingUp}
          hint={result ? `${result.modelKind} model` : "Train a model"}
          accent={!!result}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Recent Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {previewData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={previewData}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis dataKey="x" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                      }}
                    />
                    <Line type="monotone" dataKey="y" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-muted-foreground">No predictions yet</p>
                <Button asChild size="sm">
                  <Link to="/predict">
                    Train a model <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StepLink to="/upload" label="Configure cleaning" />
            <StepLink to="/predict" label="Train predictive model" />
            <StepLink to="/analytics" label="View forecast charts" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="space-y-1">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Your historical data at a glance. Upload, model, and forecast in three steps.
      </p>
    </div>
  );
}

function StepLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-accent/20"
    >
      <span>{label}</span>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
    </Link>
  );
}
