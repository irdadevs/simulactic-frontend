import { useCallback, useState } from "react";
import { mapSystemApiToDomain, mapSystemDomainToView } from "../../domain/system/mappers";
import {
  ChangeSystemNameRequest,
  ChangeSystemPositionRequest,
  systemApi,
} from "../../infra/api/system.api";
import { SystemPosition, SystemProps } from "../../types/system.types";

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const useSystems = () => {
  const [systems, setSystems] = useState<SystemProps[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<SystemProps | null>(null);
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

  const listByGalaxy = useCallback(
    (galaxyId: string) =>
      withLoading(async () => {
        const result = await systemApi.listByGalaxy(galaxyId);
        const rows = result.rows.map((row) => mapSystemDomainToView(mapSystemApiToDomain(row)));
        setSystems(rows);
        return { rows, total: result.total };
      }),
    [withLoading],
  );

  const findById = useCallback(
    (id: string) =>
      withLoading(async () => {
        const result = await systemApi.findById(id);
        if (!result) {
          setSelectedSystem(null);
          return null;
        }
        const mapped = mapSystemDomainToView(mapSystemApiToDomain(result));
        setSelectedSystem(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const findByName = useCallback(
    (name: string) =>
      withLoading(async () => {
        const result = await systemApi.findByName(name);
        if (!result) {
          setSelectedSystem(null);
          return null;
        }
        const mapped = mapSystemDomainToView(mapSystemApiToDomain(result));
        setSelectedSystem(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const findByPosition = useCallback(
    (position: SystemPosition) =>
      withLoading(async () => {
        const result = await systemApi.findByPosition(position);
        if (!result) {
          setSelectedSystem(null);
          return null;
        }
        const mapped = mapSystemDomainToView(mapSystemApiToDomain(result));
        setSelectedSystem(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const changeName = useCallback(
    (id: string, body: ChangeSystemNameRequest) =>
      withLoading(async () => {
        await systemApi.changeName(id, body);
        setSystems((prev) => prev.map((item) => (item.id === id ? { ...item, name: body.name } : item)));
        setSelectedSystem((prev) =>
          prev && prev.id === id ? { ...prev, name: body.name } : prev,
        );
      }),
    [withLoading],
  );

  const changePosition = useCallback(
    (id: string, body: ChangeSystemPositionRequest) =>
      withLoading(async () => {
        await systemApi.changePosition(id, body);
        setSystems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, position: body } : item)),
        );
        setSelectedSystem((prev) =>
          prev && prev.id === id ? { ...prev, position: body } : prev,
        );
      }),
    [withLoading],
  );

  return {
    systems,
    selectedSystem,
    isLoading,
    error,
    listByGalaxy,
    findById,
    findByName,
    findByPosition,
    changeName,
    changePosition,
  };
};
