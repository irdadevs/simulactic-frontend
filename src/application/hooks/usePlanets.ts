import { useCallback, useState } from "react";
import { mapPlanetApiToDomain, mapPlanetDomainToView } from "../../domain/planet/mappers";
import {
  ChangePlanetBiomeRequest,
  ChangePlanetNameRequest,
  ChangePlanetOrbitalRequest,
  planetApi,
} from "../../infra/api/planet.api";
import { PlanetProps } from "../../types/planet.types";

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const usePlanets = () => {
  const [planets, setPlanets] = useState<PlanetProps[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetProps | null>(null);
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

  const listBySystem = useCallback(
    (systemId: string) =>
      withLoading(async () => {
        const result = await planetApi.listBySystem(systemId);
        const rows = result.rows.map((row) => mapPlanetDomainToView(mapPlanetApiToDomain(row)));
        setPlanets(rows);
        return { rows, total: result.total };
      }),
    [withLoading],
  );

  const findById = useCallback(
    (id: string) =>
      withLoading(async () => {
        const result = await planetApi.findById(id);
        if (!result) {
          setSelectedPlanet(null);
          return null;
        }
        const mapped = mapPlanetDomainToView(mapPlanetApiToDomain(result));
        setSelectedPlanet(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const findByName = useCallback(
    (name: string) =>
      withLoading(async () => {
        const result = await planetApi.findByName(name);
        if (!result) {
          setSelectedPlanet(null);
          return null;
        }
        const mapped = mapPlanetDomainToView(mapPlanetApiToDomain(result));
        setSelectedPlanet(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const changeName = useCallback(
    (id: string, body: ChangePlanetNameRequest) =>
      withLoading(async () => {
        await planetApi.changeName(id, body);
        setPlanets((prev) => prev.map((item) => (item.id === id ? { ...item, name: body.name } : item)));
        setSelectedPlanet((prev) =>
          prev && prev.id === id ? { ...prev, name: body.name } : prev,
        );
      }),
    [withLoading],
  );

  const changeBiome = useCallback(
    (id: string, body: ChangePlanetBiomeRequest) =>
      withLoading(async () => {
        await planetApi.changeBiome(id, body);
        setPlanets((prev) =>
          prev.map((item) => (item.id === id ? { ...item, biome: body.biome } : item)),
        );
        setSelectedPlanet((prev) =>
          prev && prev.id === id ? { ...prev, biome: body.biome } : prev,
        );
      }),
    [withLoading],
  );

  const changeOrbital = useCallback(
    (id: string, body: ChangePlanetOrbitalRequest) =>
      withLoading(async () => {
        await planetApi.changeOrbital(id, body);
        setPlanets((prev) =>
          prev.map((item) => (item.id === id ? { ...item, orbital: body.orbital } : item)),
        );
        setSelectedPlanet((prev) =>
          prev && prev.id === id ? { ...prev, orbital: body.orbital } : prev,
        );
      }),
    [withLoading],
  );

  return {
    planets,
    selectedPlanet,
    isLoading,
    error,
    listBySystem,
    findById,
    findByName,
    changeName,
    changeBiome,
    changeOrbital,
  };
};
