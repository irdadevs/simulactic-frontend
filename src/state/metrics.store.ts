import { create } from "zustand";
import { MetricProps } from "../types/metric.types";

type MetricsState = {
  metrics: MetricProps[];
  selectedMetricId: string | null;
  selectedMetric: MetricProps | null;
  setMetrics: (metrics: MetricProps[]) => void;
  upsertMetric: (metric: MetricProps) => void;
  removeMetric: (metricId: string) => void;
  selectMetric: (metricId: string | null) => void;
  clearMetrics: () => void;
};

const initialState = {
  metrics: [],
  selectedMetricId: null,
  selectedMetric: null,
};

export const useMetricsStore = create<MetricsState>((set, get) => ({
  ...initialState,

  setMetrics: (metrics) =>
    set((state) => ({
      metrics,
      selectedMetric:
        state.selectedMetricId != null
          ? metrics.find((item) => item.id === state.selectedMetricId) ?? null
          : null,
    })),

  upsertMetric: (metric) =>
    set((state) => {
      const exists = state.metrics.some((item) => item.id === metric.id);
      const metrics = exists
        ? state.metrics.map((item) => (item.id === metric.id ? metric : item))
        : [metric, ...state.metrics];
      return {
        metrics,
        selectedMetric: state.selectedMetricId === metric.id ? metric : state.selectedMetric,
      };
    }),

  removeMetric: (metricId) =>
    set((state) => {
      const metrics = state.metrics.filter((item) => item.id !== metricId);
      const isSelected = state.selectedMetricId === metricId;
      return {
        metrics,
        selectedMetricId: isSelected ? null : state.selectedMetricId,
        selectedMetric: isSelected ? null : state.selectedMetric,
      };
    }),

  selectMetric: (metricId) =>
    set(() => ({
      selectedMetricId: metricId,
      selectedMetric:
        metricId == null ? null : get().metrics.find((item) => item.id === metricId) ?? null,
    })),

  clearMetrics: () => set({ ...initialState }),
}));
