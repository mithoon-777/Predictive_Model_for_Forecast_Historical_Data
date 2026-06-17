import { createFileRoute } from "@tanstack/react-router";
import { useDatasetStore } from "@/store/dataset";
import { MetricCard } from "@/components/metric-card";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { Activity, Target, TrendingDown, Gauge } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Forecastr" },
      { name: "description", content: "Historical, actual vs predicted, residual, and forecast charts." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { result } = useDatasetStore();

  if (!result) {
    return (
      <div className="mx-auto max-w-4xl p-6 md:p-10">
        <EmptyState
          title="No analytics yet"
          description="Train a model on the Predict page to see charts and metrics here."
          ctaLabel="Go to Predict"
          ctaTo="/predict"
        />
      </div>
    );
  }

  const actualVsPred = result.testActual.map((a, i) => ({
    idx: i + 1,
    actual: a,
    predicted: result.testPred[i],
  }));

  const residuals = result.testActual.map((a, i) => ({
    idx: i + 1,
    residual: +(a - result.testPred[i]).toFixed(4),
  }));

  const combined = [
    ...result.historical.map((p) => ({ x: p.x, historical: p.y, forecast: null as number | null })),
    ...result.forecast.map((p) => ({ x: p.x, historical: null as number | null, forecast: p.y })),
  ];

  const splitX = result.historical[result.historical.length - 1]?.x;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-10">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Model: <span className="text-foreground font-medium">{result.modelKind}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="R² Score" value={result.metrics.r2.toFixed(4)} icon={Gauge} accent />
        <MetricCard label="MAE" value={result.metrics.mae.toFixed(4)} icon={Target} />
        <MetricCard label="MSE" value={result.metrics.mse.toFixed(4)} icon={Activity} />
        <MetricCard label="RMSE" value={result.metrics.rmse.toFixed(4)} icon={TrendingDown} />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Historical Trend & Future Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={combined}>
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
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {splitX && <ReferenceLine x={splitX} stroke="var(--muted-foreground)" strokeDasharray="4 4" />}
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  name="Historical"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  strokeDasharray="5 4"
                  dot={false}
                  connectNulls
                  name="Forecast"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Actual vs Predicted (Test Set)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={actualVsPred}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="idx" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="actual" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="predicted" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Residuals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={residuals}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="idx" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                  <ReferenceLine y={0} stroke="var(--muted-foreground)" />
                  <Bar dataKey="residual" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Prediction Scatter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="actual"
                  name="Actual"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />
                <YAxis
                  type="number"
                  dataKey="predicted"
                  name="Predicted"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Scatter data={actualVsPred} fill="var(--chart-1)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
