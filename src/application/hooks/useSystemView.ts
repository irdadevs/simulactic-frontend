import { useCallback, useState } from "react";
import { mapAsteroidApiToDomain, mapAsteroidDomainToView } from "../../domain/asteroid/mappers";
import { mapMoonApiToDomain, mapMoonDomainToView } from "../../domain/moon/mappers";
import { mapPlanetApiToDomain, mapPlanetDomainToView } from "../../domain/planet/mappers";
import { mapStarApiToDomain, mapStarDomainToView } from "../../domain/star/mappers";
import { mapSystemApiToDomain, mapSystemDomainToView } from "../../domain/system/mappers";
import { asteroidApi } from "../../infra/api/asteroid.api";
import { moonApi } from "../../infra/api/moon.api";
import { planetApi } from "../../infra/api/planet.api";
import { starApi } from "../../infra/api/star.api";
import { systemApi } from "../../infra/api/system.api";
import { AsteroidProps } from "../../types/asteroid.types";
import { MoonProps } from "../../types/moon.types";
import { PlanetProps } from "../../types/planet.types";
import { StarProps } from "../../types/star.types";
import { SystemProps } from "../../types/system.types";

export type SystemDetailView = {
  system: SystemProps;
  stars: StarProps[];
  planets: Array<{
    planet: PlanetProps;
    moons: MoonProps[];
  }>;
  asteroids: AsteroidProps[];
};

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const useSystemView = () => {
  const [detail, setDetail] = useState<SystemDetailView | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSystemView = useCallback(async (systemId: string): Promise<SystemDetailView | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const [systemRaw, starsRaw, planetsRaw, asteroidsRaw] = await Promise.all([
        systemApi.findById(systemId),
        starApi.listBySystem(systemId),
        planetApi.listBySystem(systemId),
        asteroidApi.listBySystem(systemId),
      ]);

      if (!systemRaw) {
        setDetail(null);
        return null;
      }

      const system = mapSystemDomainToView(mapSystemApiToDomain(systemRaw));
      const stars = starsRaw.rows.map((item) => mapStarDomainToView(mapStarApiToDomain(item)));
      const planets = planetsRaw.rows.map((item) =>
        mapPlanetDomainToView(mapPlanetApiToDomain(item)),
      );
      const asteroids = asteroidsRaw.rows.map((item) =>
        mapAsteroidDomainToView(mapAsteroidApiToDomain(item)),
      );

      const moonsByPlanet = await Promise.all(
        planets.map(async (planet) => {
          const moonsRaw = await moonApi.listByPlanet(planet.id);
          const moons = moonsRaw.rows.map((moon) => mapMoonDomainToView(mapMoonApiToDomain(moon)));
          return {
            planetId: planet.id,
            moons,
          };
        }),
      );

      const detailView: SystemDetailView = {
        system,
        stars,
        planets: planets.map((planet) => ({
          planet,
          moons: moonsByPlanet.find((entry) => entry.planetId === planet.id)?.moons ?? [],
        })),
        asteroids,
      };

      setDetail(detailView);
      return detailView;
    } catch (err: unknown) {
      setError(toErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSystemView = useCallback(() => {
    setDetail(null);
    setError(null);
  }, []);

  return {
    detail,
    isLoading,
    error,
    loadSystemView,
    clearSystemView,
  };
};
