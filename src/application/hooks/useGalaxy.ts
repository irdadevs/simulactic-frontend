import { useCallback, useState } from "react";
import {
  ChangeGalaxyNameRequest,
  ChangeGalaxyShapeRequest,
  CreateGalaxyRequest,
  galaxyApi,
  ListGalaxiesQuery,
} from "../../infra/api/galaxy.api";
import { mapAsteroidApiToDomain, mapAsteroidDomainToView } from "../../domain/asteroid/mappers";
import { mapGalaxyApiToDomain, mapGalaxyDomainToView } from "../../domain/galaxy/mappers";
import { mapMoonApiToDomain, mapMoonDomainToView } from "../../domain/moon/mappers";
import { mapPlanetApiToDomain, mapPlanetDomainToView } from "../../domain/planet/mappers";
import { mapStarApiToDomain, mapStarDomainToView } from "../../domain/star/mappers";
import { mapSystemApiToDomain, mapSystemDomainToView } from "../../domain/system/mappers";
import { AsteroidProps } from "../../types/asteroid.types";
import { GalaxyProps } from "../../types/galaxy.types";
import { MoonProps } from "../../types/moon.types";
import { PlanetProps } from "../../types/planet.types";
import { StarProps } from "../../types/star.types";
import { SystemProps } from "../../types/system.types";

type GalaxyPopulationView = {
  galaxy: GalaxyProps;
  systems: Array<{
    system: SystemProps;
    stars: StarProps[];
    planets: Array<{
      planet: PlanetProps;
      moons: MoonProps[];
    }>;
    asteroids: AsteroidProps[];
  }>;
};

const mapPopulation = (input: Awaited<ReturnType<typeof galaxyApi.populate>>): GalaxyPopulationView => ({
  galaxy: mapGalaxyDomainToView(mapGalaxyApiToDomain(input.galaxy)),
  systems: input.systems.map((systemNode) => ({
    system: mapSystemDomainToView(mapSystemApiToDomain(systemNode.system)),
    stars: systemNode.stars.map((star) => mapStarDomainToView(mapStarApiToDomain(star))),
    planets: systemNode.planets.map((planetNode) => ({
      planet: mapPlanetDomainToView(mapPlanetApiToDomain(planetNode.planet)),
      moons: planetNode.moons.map((moon) => mapMoonDomainToView(mapMoonApiToDomain(moon))),
    })),
    asteroids: systemNode.asteroids.map((asteroid) =>
      mapAsteroidDomainToView(mapAsteroidApiToDomain(asteroid)),
    ),
  })),
});

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const useGalaxy = () => {
  const [galaxies, setGalaxies] = useState<GalaxyProps[]>([]);
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyProps | null>(null);
  const [population, setPopulation] = useState<GalaxyPopulationView | null>(null);
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

  const createGalaxy = useCallback(
    (body: CreateGalaxyRequest) =>
      withLoading(async () => {
        const created = await galaxyApi.create(body);
        const view = mapGalaxyDomainToView(mapGalaxyApiToDomain(created));
        setGalaxies((prev) => [view, ...prev]);
        setSelectedGalaxy(view);
        return view;
      }),
    [withLoading],
  );

  const loadGalaxies = useCallback(
    (query?: ListGalaxiesQuery) =>
      withLoading(async () => {
        const result = await galaxyApi.list(query);
        const mapped = result.rows.map((item) =>
          mapGalaxyDomainToView(mapGalaxyApiToDomain(item)),
        );
        setGalaxies(mapped);
        return { rows: mapped, total: result.total };
      }),
    [withLoading],
  );

  const loadGalaxyById = useCallback(
    (id: string) =>
      withLoading(async () => {
        const result = await galaxyApi.findById(id);
        if (!result) {
          setSelectedGalaxy(null);
          return null;
        }

        const mapped = mapGalaxyDomainToView(mapGalaxyApiToDomain(result));
        setSelectedGalaxy(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const loadGalaxyPopulation = useCallback(
    (id: string) =>
      withLoading(async () => {
        const result = await galaxyApi.populate(id);
        const mapped = mapPopulation(result);
        setPopulation(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const changeGalaxyName = useCallback(
    (id: string, body: ChangeGalaxyNameRequest) =>
      withLoading(async () => {
        await galaxyApi.changeName(id, body);
        setGalaxies((prev) => prev.map((item) => (item.id === id ? { ...item, name: body.name } : item)));
        setSelectedGalaxy((prev) => (prev && prev.id === id ? { ...prev, name: body.name } : prev));
      }),
    [withLoading],
  );

  const changeGalaxyShape = useCallback(
    (id: string, body: ChangeGalaxyShapeRequest) =>
      withLoading(async () => {
        await galaxyApi.changeShape(id, body);
        setGalaxies((prev) =>
          prev.map((item) => (item.id === id ? { ...item, shape: body.shape } : item)),
        );
        setSelectedGalaxy((prev) =>
          prev && prev.id === id ? { ...prev, shape: body.shape } : prev,
        );
      }),
    [withLoading],
  );

  const deleteGalaxy = useCallback(
    (id: string) =>
      withLoading(async () => {
        await galaxyApi.remove(id);
        setGalaxies((prev) => prev.filter((item) => item.id !== id));
        setSelectedGalaxy((prev) => (prev && prev.id === id ? null : prev));
        setPopulation((prev) => (prev && prev.galaxy.id === id ? null : prev));
      }),
    [withLoading],
  );

  return {
    galaxies,
    selectedGalaxy,
    population,
    isLoading,
    error,
    createGalaxy,
    loadGalaxies,
    loadGalaxyById,
    loadGalaxyPopulation,
    changeGalaxyName,
    changeGalaxyShape,
    deleteGalaxy,
  };
};
