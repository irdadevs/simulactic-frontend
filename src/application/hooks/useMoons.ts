import { useCallback, useState } from "react";
import { mapMoonApiToDomain, mapMoonDomainToView } from "../../domain/moon/mappers";
import {
  ChangeMoonNameRequest,
  ChangeMoonOrbitalRequest,
  ChangeMoonSizeRequest,
  moonApi,
} from "../../infra/api/moon.api";
import { MoonProps } from "../../types/moon.types";

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const useMoons = () => {
  const [moons, setMoons] = useState<MoonProps[]>([]);
  const [selectedMoon, setSelectedMoon] = useState<MoonProps | null>(null);
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

  const listByPlanet = useCallback(
    (planetId: string) =>
      withLoading(async () => {
        const result = await moonApi.listByPlanet(planetId);
        const rows = result.rows.map((row) => mapMoonDomainToView(mapMoonApiToDomain(row)));
        setMoons(rows);
        return { rows, total: result.total };
      }),
    [withLoading],
  );

  const findById = useCallback(
    (id: string) =>
      withLoading(async () => {
        const result = await moonApi.findById(id);
        if (!result) {
          setSelectedMoon(null);
          return null;
        }
        const mapped = mapMoonDomainToView(mapMoonApiToDomain(result));
        setSelectedMoon(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const findByName = useCallback(
    (name: string) =>
      withLoading(async () => {
        const result = await moonApi.findByName(name);
        if (!result) {
          setSelectedMoon(null);
          return null;
        }
        const mapped = mapMoonDomainToView(mapMoonApiToDomain(result));
        setSelectedMoon(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const changeName = useCallback(
    (id: string, body: ChangeMoonNameRequest) =>
      withLoading(async () => {
        await moonApi.changeName(id, body);
        setMoons((prev) => prev.map((item) => (item.id === id ? { ...item, name: body.name } : item)));
        setSelectedMoon((prev) => (prev && prev.id === id ? { ...prev, name: body.name } : prev));
      }),
    [withLoading],
  );

  const changeSize = useCallback(
    (id: string, body: ChangeMoonSizeRequest) =>
      withLoading(async () => {
        await moonApi.changeSize(id, body);
        setMoons((prev) => prev.map((item) => (item.id === id ? { ...item, size: body.size } : item)));
        setSelectedMoon((prev) => (prev && prev.id === id ? { ...prev, size: body.size } : prev));
      }),
    [withLoading],
  );

  const changeOrbital = useCallback(
    (id: string, body: ChangeMoonOrbitalRequest) =>
      withLoading(async () => {
        await moonApi.changeOrbital(id, body);
        setMoons((prev) =>
          prev.map((item) => (item.id === id ? { ...item, orbital: body.orbital } : item)),
        );
        setSelectedMoon((prev) =>
          prev && prev.id === id ? { ...prev, orbital: body.orbital } : prev,
        );
      }),
    [withLoading],
  );

  return {
    moons,
    selectedMoon,
    isLoading,
    error,
    listByPlanet,
    findById,
    findByName,
    changeName,
    changeSize,
    changeOrbital,
  };
};
