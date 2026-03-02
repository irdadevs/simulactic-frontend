import { useCallback, useState } from "react";
import { mapLogApiToDomain, mapLogDomainToView } from "../../domain/log/mappers";
import { CreateLogRequest, ListLogsQuery, logApi } from "../../infra/api/log.api";
import { LogProps } from "../../types/log.types";

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const useLogs = () => {
  const [logs, setLogs] = useState<LogProps[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogProps | null>(null);
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

  const create = useCallback(
    (body: CreateLogRequest, view?: "dashboard") =>
      withLoading(async () => {
        const result = await logApi.create(body, view);
        const mapped = mapLogDomainToView(mapLogApiToDomain(result));
        setLogs((prev) => [mapped, ...prev]);
        setSelectedLog(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const list = useCallback(
    (query?: ListLogsQuery) =>
      withLoading(async () => {
        const result = await logApi.list(query);
        const rows = result.rows.map((row) => mapLogDomainToView(mapLogApiToDomain(row)));
        setLogs(rows);
        return { rows, total: result.total };
      }),
    [withLoading],
  );

  const findById = useCallback(
    (id: string, view?: "dashboard") =>
      withLoading(async () => {
        const result = await logApi.findById(id, view);
        if (!result) {
          setSelectedLog(null);
          return null;
        }
        const mapped = mapLogDomainToView(mapLogApiToDomain(result));
        setSelectedLog(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const resolve = useCallback(
    (id: string) =>
      withLoading(async () => {
        await logApi.resolve(id);
        const now = new Date();
        setLogs((prev) =>
          prev.map((item) => (item.id === id ? { ...item, resolvedAt: now } : item)),
        );
        setSelectedLog((prev) => (prev && prev.id === id ? { ...prev, resolvedAt: now } : prev));
      }),
    [withLoading],
  );

  return {
    logs,
    selectedLog,
    isLoading,
    error,
    create,
    list,
    findById,
    resolve,
  };
};
