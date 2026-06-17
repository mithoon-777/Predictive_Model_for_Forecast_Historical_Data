import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Dataset } from "@/services/csv";
import type { CleanConfig } from "@/services/clean";
import type { Metrics } from "@/services/metrics";

export type ModelKind = "linear" | "polynomial" | "timeseries";

export interface ModelConfig {
  kind: ModelKind;
  degree: number;
  features: string[];
  target: string;
  dateColumn: string | null;
  testRatio: number;
  horizon: number;
}

export interface PredictionResult {
  trainActual: number[];
  trainPred: number[];
  testActual: number[];
  testPred: number[];
  forecast: { x: string; y: number }[];
  historical: { x: string; y: number }[];
  metrics: Metrics;
  modelKind: ModelKind;
}

interface State {
  raw: Dataset | null;
  cleaned: Dataset | null;
  cleanConfig: CleanConfig;
  modelConfig: ModelConfig;
  result: PredictionResult | null;
  setRaw: (d: Dataset | null) => void;
  setCleaned: (d: Dataset | null) => void;
  setCleanConfig: (c: Partial<CleanConfig>) => void;
  setModelConfig: (c: Partial<ModelConfig>) => void;
  setResult: (r: PredictionResult | null) => void;
  reset: () => void;
}

const defaultClean: CleanConfig = { missing: "mean", dedupe: true, scale: "none" };
const defaultModel: ModelConfig = {
  kind: "linear",
  degree: 2,
  features: [],
  target: "",
  dateColumn: null,
  testRatio: 0.2,
  horizon: 12,
};

export const useDatasetStore = create<State>()(
  persist(
    (set) => ({
      raw: null,
      cleaned: null,
      cleanConfig: defaultClean,
      modelConfig: defaultModel,
      result: null,
      setRaw: (raw) => set({ raw, cleaned: raw, result: null }),
      setCleaned: (cleaned) => set({ cleaned }),
      setCleanConfig: (c) =>
        set((s) => ({ cleanConfig: { ...s.cleanConfig, ...c } })),
      setModelConfig: (c) =>
        set((s) => ({ modelConfig: { ...s.modelConfig, ...c } })),
      setResult: (result) => set({ result }),
      reset: () =>
        set({ raw: null, cleaned: null, result: null, cleanConfig: defaultClean, modelConfig: defaultModel }),
    }),
    {
      name: "predictive-analytics-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage)
      ),
    }
  )
);
