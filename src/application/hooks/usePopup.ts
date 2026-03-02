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

type PopupPayload =
  | { kind: "system"; data: SystemProps }
  | { kind: "star"; data: StarProps }
  | { kind: "planet"; data: PlanetProps }
  | { kind: "moon"; data: MoonProps }
  | { kind: "asteroid"; data: AsteroidProps };

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const usePopup = () => {
  const [payload, setPayload] = useState<PopupPayload | null>(null);
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

  const openSystemPopup = useCallback(
    (id: string) =>
      withLoading(async () => {
        const result = await systemApi.findById(id);
        if (!result) {
          setPayload(null);
          return null;
        }
        const mapped = mapSystemDomainToView(mapSystemApiToDomain(result));
        const next: PopupPayload = { kind: "system", data: mapped };
        setPayload(next);
        return next;
      }),
    [withLoading],
  );

  const openStarPopup = useCallback(
    (id: string) =>
      withLoading(async () => {
        const result = await starApi.findById(id);
        if (!result) {
          setPayload(null);
          return null;
        }
        const mapped = mapStarDomainToView(mapStarApiToDomain(result));
        const next: PopupPayload = { kind: "star", data: mapped };
        setPayload(next);
        return next;
      }),
    [withLoading],
  );

  const openPlanetPopup = useCallback(
    (id: string) =>
      withLoading(async () => {
        const result = await planetApi.findById(id);
        if (!result) {
          setPayload(null);
          return null;
        }
        const mapped = mapPlanetDomainToView(mapPlanetApiToDomain(result));
        const next: PopupPayload = { kind: "planet", data: mapped };
        setPayload(next);
        return next;
      }),
    [withLoading],
  );

  const openMoonPopup = useCallback(
    (id: string) =>
      withLoading(async () => {
        const result = await moonApi.findById(id);
        if (!result) {
          setPayload(null);
          return null;
        }
        const mapped = mapMoonDomainToView(mapMoonApiToDomain(result));
        const next: PopupPayload = { kind: "moon", data: mapped };
        setPayload(next);
        return next;
      }),
    [withLoading],
  );

  const openAsteroidPopup = useCallback(
    (id: string) =>
      withLoading(async () => {
        const result = await asteroidApi.findById(id);
        if (!result) {
          setPayload(null);
          return null;
        }
        const mapped = mapAsteroidDomainToView(mapAsteroidApiToDomain(result));
        const next: PopupPayload = { kind: "asteroid", data: mapped };
        setPayload(next);
        return next;
      }),
    [withLoading],
  );

  const closePopup = useCallback(() => {
    setPayload(null);
    setError(null);
  }, []);

  return {
    payload,
    isLoading,
    error,
    openSystemPopup,
    openStarPopup,
    openPlanetPopup,
    openMoonPopup,
    openAsteroidPopup,
    closePopup,
  };
};
