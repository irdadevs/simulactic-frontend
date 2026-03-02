import { useCallback, useState } from "react";
import { mapAsteroidApiToDomain, mapAsteroidDomainToView } from "../../domain/asteroid/mappers";
import {
  asteroidApi,
  ChangeAsteroidNameRequest,
  ChangeAsteroidOrbitalRequest,
  ChangeAsteroidSizeRequest,
  ChangeAsteroidTypeRequest,
} from "../../infra/api/asteroid.api";
import { AsteroidProps } from "../../types/asteroid.types";

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const useAsteroids = () => {
  const [asteroids, setAsteroids] = useState<AsteroidProps[]>([]);
  const [selectedAsteroid, setSelectedAsteroid] = useState<AsteroidProps | null>(null);
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
        const result = await asteroidApi.listBySystem(systemId);
        const rows = result.rows.map((row) =>
          mapAsteroidDomainToView(mapAsteroidApiToDomain(row)),
        );
        setAsteroids(rows);
        return { rows, total: result.total };
      }),
    [withLoading],
  );

  const findById = useCallback(
    (id: string) =>
      withLoading(async () => {
        const result = await asteroidApi.findById(id);
        if (!result) {
          setSelectedAsteroid(null);
          return null;
        }
        const mapped = mapAsteroidDomainToView(mapAsteroidApiToDomain(result));
        setSelectedAsteroid(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const findByName = useCallback(
    (name: string) =>
      withLoading(async () => {
        const result = await asteroidApi.findByName(name);
        if (!result) {
          setSelectedAsteroid(null);
          return null;
        }
        const mapped = mapAsteroidDomainToView(mapAsteroidApiToDomain(result));
        setSelectedAsteroid(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const changeName = useCallback(
    (id: string, body: ChangeAsteroidNameRequest) =>
      withLoading(async () => {
        await asteroidApi.changeName(id, body);
        setAsteroids((prev) =>
          prev.map((item) => (item.id === id ? { ...item, name: body.name } : item)),
        );
        setSelectedAsteroid((prev) =>
          prev && prev.id === id ? { ...prev, name: body.name } : prev,
        );
      }),
    [withLoading],
  );

  const changeType = useCallback(
    (id: string, body: ChangeAsteroidTypeRequest) =>
      withLoading(async () => {
        await asteroidApi.changeType(id, body);
        setAsteroids((prev) =>
          prev.map((item) => (item.id === id ? { ...item, type: body.type } : item)),
        );
        setSelectedAsteroid((prev) =>
          prev && prev.id === id ? { ...prev, type: body.type } : prev,
        );
      }),
    [withLoading],
  );

  const changeSize = useCallback(
    (id: string, body: ChangeAsteroidSizeRequest) =>
      withLoading(async () => {
        await asteroidApi.changeSize(id, body);
        setAsteroids((prev) =>
          prev.map((item) => (item.id === id ? { ...item, size: body.size } : item)),
        );
        setSelectedAsteroid((prev) =>
          prev && prev.id === id ? { ...prev, size: body.size } : prev,
        );
      }),
    [withLoading],
  );

  const changeOrbital = useCallback(
    (id: string, body: ChangeAsteroidOrbitalRequest) =>
      withLoading(async () => {
        await asteroidApi.changeOrbital(id, body);
        setAsteroids((prev) =>
          prev.map((item) => (item.id === id ? { ...item, orbital: body.orbital } : item)),
        );
        setSelectedAsteroid((prev) =>
          prev && prev.id === id ? { ...prev, orbital: body.orbital } : prev,
        );
      }),
    [withLoading],
  );

  return {
    asteroids,
    selectedAsteroid,
    isLoading,
    error,
    listBySystem,
    findById,
    findByName,
    changeName,
    changeType,
    changeSize,
    changeOrbital,
  };
};
