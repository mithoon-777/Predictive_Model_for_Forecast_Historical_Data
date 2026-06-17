import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDatasetStore, type ModelKind, type PredictionResult } from "@/store/dataset";
import { trainLinear, predictLinear } from "@/services/models/linear";
import { trainPolynomial, predictPolynomial } from "@/services/models/polynomial";
import { trainTimeSeries, forecastFuture, predictTimeSeriesIndex } from "@/services/models/timeseries";
import { trainTestSplit } from "@/services/split";
import { computeMetrics } from "@/services/metrics";
import { toCsv } from "@/services/csv";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Download, Play } from "lucide-react";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Predict — Forecastr" },
      { name: "description", content: "Train regression or time-series models on your data." },
    ],
  }),
  component: PredictPage,
});

function PredictPage() {
  const { cleaned, modelConfig, setModelConfig, setResult, result } = useDatasetStore();
  const [training, setTraining] = useState(false);

  const numericCols = useMemo(
    () => (cleaned ? cleaned.columns.filter((c) => cleaned.types[c] === "number") : []),
    [cleaned]
  );

  if (!cleaned) {
    return (
      <div className="mx-auto max-w-4xl p-6 md:p-10">
        <EmptyState description="Upload a CSV first to train predictive models." />
      </div>
    );
  }

  const train = () => {
    if (!modelConfig.target) {
      toast.error("Pick a target column on the Upload page");
      return;
    }
    setTraining(true);
    try {
      const res = runTraining(cleaned, modelConfig);
      setResult(res);
      toast.success(`Trained ${res.modelKind} model · R² ${res.metrics.r2.toFixed(3)}`);
    } catch (e) {
      toast.error("Training failed: " + (e as Error).message);
    } finally {
      setTraining(false);
    }
  };

  const exportCsv = () => {
    if (!result) return;
    const rows = [
      ...result.testActual.map((a, i) => ({ split: "test", actual: a, predicted: result.testPred[i] })),
      ...result.forecast.map((f) => ({ split: "forecast", actual: "", predicted: f.y, x: f.x })),
    ];
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "predictions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFeature = (col: string) => {
    const has = modelConfig.features.includes(col);
    setModelConfig({
      features: has ? modelConfig.features.filter((c) => c !== col) : [...modelConfig.features, col],
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-10">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold">Predict</h1>
        <p className="text-sm text-muted-foreground">
          Configure your model, split the data, and train.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">Model Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Model type</Label>
                <Select
                  value={modelConfig.kind}
                  onValueChange={(v) => setModelConfig({ kind: v as ModelKind })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear Regression</SelectItem>
                    <SelectItem value="polynomial">Polynomial Regression</SelectItem>
                    <SelectItem value="timeseries" disabled={!modelConfig.dateColumn}>
                      Time-Series Forecast {!modelConfig.dateColumn && "(needs date col)"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {modelConfig.kind === "polynomial" && (
                <div className="space-y-2">
                  <Label>Polynomial degree: {modelConfig.degree}</Label>
                  <Slider
                    value={[modelConfig.degree]}
                    min={2}
                    max={5}
                    step={1}
                    onValueChange={([v]) => setModelConfig({ degree: v })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Train/test split: {Math.round((1 - modelConfig.testRatio) * 100)}% / {Math.round(modelConfig.testRatio * 100)}%</Label>
                <Slider
                  value={[modelConfig.testRatio * 100]}
                  min={10}
                  max={40}
                  step={5}
                  onValueChange={([v]) => setModelConfig({ testRatio: v / 100 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Forecast horizon: {modelConfig.horizon}</Label>
                <Slider
                  value={[modelConfig.horizon]}
                  min={1}
                  max={60}
                  step={1}
                  onValueChange={([v]) => setModelConfig({ horizon: v })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target: <span className="text-primary font-medium">{modelConfig.target || "—"}</span></Label>
              {modelConfig.kind !== "timeseries" && (
                <>
                  <Label className="text-xs text-muted-foreground">Features</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {numericCols.filter((c) => c !== modelConfig.target).map((c) => (
                      <label
                        key={c}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-2 text-sm hover:border-primary/40"
                      >
                        <Checkbox
                          checked={modelConfig.features.includes(c)}
                          onCheckedChange={() => toggleFeature(c)}
                        />
                        <span className="truncate">{c}</span>
                      </label>
                    ))}
                  </div>
                  {numericCols.filter((c) => c !== modelConfig.target).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No other numeric columns available. Try time-series or add more numeric features.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={train} disabled={training} className="gradient-primary text-primary-foreground shadow-elegant">
                <Play className="mr-2 h-4 w-4" /> {training ? "Training..." : "Train Model"}
              </Button>
              {result && (
                <Button variant="outline" onClick={exportCsv}>
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Latest Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-3">
                <Metric label="R² Score" value={result.metrics.r2.toFixed(4)} />
                <Metric label="MAE" value={result.metrics.mae.toFixed(4)} />
                <Metric label="MSE" value={result.metrics.mse.toFixed(4)} />
                <Metric label="RMSE" value={result.metrics.rmse.toFixed(4)} />
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/analytics">View charts</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Brain className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No model trained yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Test Predictions (first 20)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Actual</th>
                    <th className="px-3 py-2 text-left font-medium">Predicted</th>
                    <th className="px-3 py-2 text-left font-medium">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {result.testActual.slice(0, 20).map((a, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-1.5 tabular-nums">{a.toFixed(3)}</td>
                      <td className="px-3 py-1.5 tabular-nums">{result.testPred[i].toFixed(3)}</td>
                      <td className="px-3 py-1.5 tabular-nums text-muted-foreground">
                        {(a - result.testPred[i]).toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card/40 px-3 py-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-display text-base font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function runTraining(
  cleaned: NonNullable<ReturnType<typeof useDatasetStore.getState>["cleaned"]>,
  cfg: ReturnType<typeof useDatasetStore.getState>["modelConfig"]
): PredictionResult {
  const target = cfg.target;
  const dateCol = cfg.dateColumn;

  if (cfg.kind === "timeseries") {
    if (!dateCol) throw new Error("Time-series needs a date column");
    const points = cleaned.rows
      .filter((r) => r[dateCol] && typeof r[target] === "number")
      .map((r) => ({ t: new Date(r[dateCol] as string).getTime(), y: r[target] as number }))
      .sort((a, b) => a.t - b.t);
    if (points.length < 4) throw new Error("Need at least 4 valid rows");
    const split = trainTestSplitTimeseries(points, cfg.testRatio);
    const model = trainTimeSeries(split.train);
    const allIdx = points.map((_, i) => i);
    const allPred = predictTimeSeriesIndex(model, allIdx);
    const trainCount = split.train.length;
    const trainActual = split.train.map((p) => p.y);
    const trainPred = allPred.slice(0, trainCount);
    const testActual = split.test.map((p) => p.y);
    const testPred = allPred.slice(trainCount);
    const forecast = forecastFuture(model, points.length - 1, cfg.horizon).map((f) => ({
      x: new Date(f.t).toISOString().slice(0, 10),
      y: f.y,
    }));
    const historical = points.map((p) => ({
      x: new Date(p.t).toISOString().slice(0, 10),
      y: p.y,
    }));
    return {
      trainActual,
      trainPred,
      testActual,
      testPred,
      forecast,
      historical,
      metrics: computeMetrics(testActual, testPred),
      modelKind: "timeseries",
    };
  }

  // Regression
  const features = cfg.features.length ? cfg.features : [];
  if (features.length === 0) throw new Error("Select at least one feature column");
  const validRows = cleaned.rows.filter(
    (r) => typeof r[target] === "number" && features.every((f) => typeof r[f] === "number")
  );
  if (validRows.length < 4) throw new Error("Need at least 4 valid rows");
  const { train, test } = trainTestSplit(validRows, cfg.testRatio);
  const X = (rs: typeof validRows) => rs.map((r) => features.map((f) => r[f] as number));
  const y = (rs: typeof validRows) => rs.map((r) => r[target] as number);

  let predictFn: (X: number[][]) => number[];
  if (cfg.kind === "polynomial") {
    const m = trainPolynomial(X(train), y(train), cfg.degree);
    predictFn = (x) => predictPolynomial(m, x);
  } else {
    const m = trainLinear(X(train), y(train));
    predictFn = (x) => predictLinear(m, x);
  }
  const trainPred = predictFn(X(train));
  const testPred = predictFn(X(test));
  const historical = validRows.map((r, i) => ({ x: String(i + 1), y: r[target] as number }));
  // Forecast: project mean +/- linear walk on features (simple: use mean feature values)
  const featureMeans = features.map(
    (f) => validRows.reduce((s, r) => s + (r[f] as number), 0) / validRows.length
  );
  const forecastX = Array.from({ length: cfg.horizon }, () => featureMeans);
  const forecastY = predictFn(forecastX);
  const forecast = forecastY.map((v, i) => ({ x: `+${i + 1}`, y: v }));

  return {
    trainActual: y(train),
    trainPred,
    testActual: y(test),
    testPred,
    forecast,
    historical,
    metrics: computeMetrics(y(test), testPred),
    modelKind: cfg.kind,
  };
}

function trainTestSplitTimeseries<T>(arr: T[], testRatio: number) {
  const cut = Math.max(1, Math.floor(arr.length * (1 - testRatio)));
  return { train: arr.slice(0, cut), test: arr.slice(cut) };
}
