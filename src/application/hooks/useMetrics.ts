import { useCallback, useState } from "react";
import { mapMetricApiToDomain, mapMetricDomainToView } from "../../domain/metric/mappers";
import {
  ListMetricsQuery,
  metricApi,
  MetricsDashboardQuery,
  MetricsDashboardResponse,
  TrackMetricRequest,
} from "../../infra/api/metric.api";
import { MetricProps } from "../../types/metric.types";

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const useMetrics = () => {
  const [metrics, setMetrics] = useState<MetricProps[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<MetricProps | null>(null);
  const [dashboard, setDashboard] = useState<MetricsDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withLoading = useCallback(async <T,>(work: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      return await work();
    } catch (err: unknown) {
      setError(toErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const track = useCallback(
    (body: TrackMetricRequest, view?: "dashboard") =>
      withLoading(async () => {
        const result = await metricApi.track(body, view);
        const mapped = mapMetricDomainToView(mapMetricApiToDomain(result));
        setMetrics((prev) => [mapped, ...prev]);
        setSelectedMetric(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const list = useCallback(
    (query?: ListMetricsQuery) =>
      withLoading(async () => {
        const result = await metricApi.list(query);
        const rows = result.rows.map((row) => mapMetricDomainToView(mapMetricApiToDomain(row)));
        setMetrics(rows);
        return { rows, total: result.total };
      }),
    [withLoading],
  );

  const findById = useCallback(
    (id: string, view?: "dashboard") =>
      withLoading(async () => {
        const result = await metricApi.findById(id, view);
        if (!result) {
          setSelectedMetric(null);
          return null;
        }
        const mapped = mapMetricDomainToView(mapMetricApiToDomain(result));
        setSelectedMetric(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const loadDashboard = useCallback(
    (query?: MetricsDashboardQuery) =>
      withLoading(async () => {
        const result = await metricApi.dashboard(query);
        setDashboard(result);
        return result;
      }),
    [withLoading],
  );

  return {
    metrics,
    selectedMetric,
    dashboard,
    isLoading,
    error,
    track,
    list,
    findById,
    loadDashboard,
  };
};
