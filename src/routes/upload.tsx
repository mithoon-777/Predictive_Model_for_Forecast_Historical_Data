import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useDatasetStore } from "@/store/dataset";
import { parseCsv } from "@/services/csv";
import { cleanDataset } from "@/services/clean";
import { FileDropzone } from "@/components/file-dropzone";
import { DatasetTable } from "@/components/dataset-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Wand2 } from "lucide-react";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Data — Forecastr" },
      { name: "description", content: "Upload a CSV and configure data cleaning options." },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const { raw, cleaned, cleanConfig, modelConfig, setRaw, setCleaned, setCleanConfig, setModelConfig, reset } =
    useDatasetStore();
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const ds = await parseCsv(file);
      setRaw(ds);
      const firstNumeric = ds.columns.find((c) => ds.types[c] === "number") ?? "";
      const dateCol = ds.columns.find((c) => ds.types[c] === "date") ?? null;
      setModelConfig({
        target: firstNumeric,
        features: ds.columns.filter((c) => c !== firstNumeric && ds.types[c] === "number"),
        dateColumn: dateCol,
      });
      toast.success(`Loaded ${ds.rows.length} rows from ${file.name}`);
    } catch (e) {
      toast.error("Failed to parse CSV: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const applyClean = () => {
    if (!raw) return;
    const ds = cleanDataset(raw, cleanConfig);
    setCleaned(ds);
    toast.success(`Cleaned dataset: ${ds.rows.length} rows`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold">Upload & Clean</h1>
          <p className="text-sm text-muted-foreground">
            Drop a CSV file, preview rows, and configure preprocessing.
          </p>
        </div>
        {raw && (
          <Button variant="outline" size="sm" onClick={reset}>
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {!raw && <FileDropzone onFile={handleFile} />}
      {loading && <p className="text-sm text-muted-foreground">Parsing...</p>}

      {raw && cleaned && (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2 shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-base">Preview · {raw.fileName}</CardTitle>
              </CardHeader>
              <CardContent>
                <DatasetTable data={cleaned} />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-base">Preprocessing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Missing values</Label>
                  <Select
                    value={cleanConfig.missing}
                    onValueChange={(v) => setCleanConfig({ missing: v as never })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drop">Drop rows</SelectItem>
                      <SelectItem value="mean">Fill with mean</SelectItem>
                      <SelectItem value="median">Fill with median</SelectItem>
                      <SelectItem value="zero">Fill with zero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Scaling</Label>
                  <Select
                    value={cleanConfig.scale}
                    onValueChange={(v) => setCleanConfig({ scale: v as never })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="minmax">Min-Max (0–1)</SelectItem>
                      <SelectItem value="zscore">Z-Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-md border border-border p-3">
                  <Label htmlFor="dedupe" className="cursor-pointer">Remove duplicates</Label>
                  <Switch
                    id="dedupe"
                    checked={cleanConfig.dedupe}
                    onCheckedChange={(v) => setCleanConfig({ dedupe: v })}
                  />
                </div>

                <Button onClick={applyClean} className="w-full">
                  <Wand2 className="mr-2 h-4 w-4" /> Apply Cleaning
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-base">Target & Date Columns</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Target column (to predict)</Label>
                <Select
                  value={modelConfig.target}
                  onValueChange={(v) =>
                    setModelConfig({
                      target: v,
                      features: cleaned.columns.filter((c) => c !== v && cleaned.types[c] === "number"),
                    })
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                  <SelectContent>
                    {cleaned.columns
                      .filter((c) => cleaned.types[c] === "number")
                      .map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date column (optional, for time-series)</Label>
                <Select
                  value={modelConfig.dateColumn ?? "__none__"}
                  onValueChange={(v) => setModelConfig({ dateColumn: v === "__none__" ? null : v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {cleaned.columns
                      .filter((c) => cleaned.types[c] === "date")
                      .map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
