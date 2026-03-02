import { useEffect } from "react";
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
import { useUiStore } from "../../state/ui.store";

export const usePopupController = () => {
  const popup = useUiStore((state) => state.popup);
  const popupRequest = useUiStore((state) => state.popupRequest);
  const setPopup = useUiStore((state) => state.setPopup);
  const clearPopupRequest = useUiStore((state) => state.clearPopupRequest);

  useEffect(() => {
    if (!popupRequest) return;
    let cancelled = false;

    const run = async () => {
      try {
        if (popupRequest.kind === "system") {
          const [systemRaw, starsRaw, planetsRaw, asteroidsRaw] = await Promise.all([
            systemApi.findById(popupRequest.systemId),
            starApi.listBySystem(popupRequest.systemId),
            planetApi.listBySystem(popupRequest.systemId),
            asteroidApi.listBySystem(popupRequest.systemId),
          ]);

          if (!systemRaw) {
            if (!cancelled) setPopup(null);
            return;
          }

          const planets = planetsRaw.rows.map((planet) =>
            mapPlanetDomainToView(mapPlanetApiToDomain(planet)),
          );
          const moonGroups = await Promise.all(
            planets.map(async (planet) => {
              const moonsRaw = await moonApi.listByPlanet(planet.id);
              return {
                planetId: planet.id,
                moons: moonsRaw.rows.map((moon) => mapMoonDomainToView(mapMoonApiToDomain(moon))),
              };
            }),
          );

          if (cancelled) return;
          setPopup({
            kind: "system",
            data: {
              system: mapSystemDomainToView(mapSystemApiToDomain(systemRaw)),
              stars: starsRaw.rows.map((star) => mapStarDomainToView(mapStarApiToDomain(star))),
              planets: planets.map((planet) => ({
                planet,
                moons: moonGroups.find((entry) => entry.planetId === planet.id)?.moons ?? [],
              })),
              asteroids: asteroidsRaw.rows.map((asteroid) =>
                mapAsteroidDomainToView(mapAsteroidApiToDomain(asteroid)),
              ),
            },
          });
          return;
        }

        if (popupRequest.kind === "star") {
          const star = await starApi.findById(popupRequest.starId);
          if (!cancelled) {
            setPopup(star ? { kind: "star", data: mapStarDomainToView(mapStarApiToDomain(star)) } : null);
          }
          return;
        }

        if (popupRequest.kind === "planet") {
          const planet = await planetApi.findById(popupRequest.planetId);
          if (!planet) {
            if (!cancelled) setPopup(null);
            return;
          }

          const mappedPlanet = mapPlanetDomainToView(mapPlanetApiToDomain(planet));
          const moonsRaw = await moonApi.listByPlanet(mappedPlanet.id);
          if (cancelled) return;

          setPopup({
            kind: "planet",
            data: {
              planet: mappedPlanet,
              moons: moonsRaw.rows.map((moon) => mapMoonDomainToView(mapMoonApiToDomain(moon))),
            },
          });
          return;
        }

        if (popupRequest.kind === "moon") {
          const moon = await moonApi.findById(popupRequest.moonId);
          if (!cancelled) {
            setPopup(moon ? { kind: "moon", data: mapMoonDomainToView(mapMoonApiToDomain(moon)) } : null);
          }
          return;
        }

        const asteroid = await asteroidApi.findById(popupRequest.asteroidId);
        if (!cancelled) {
          setPopup(
            asteroid
              ? { kind: "asteroid", data: mapAsteroidDomainToView(mapAsteroidApiToDomain(asteroid)) }
              : null,
          );
        }
      } finally {
        if (!cancelled) clearPopupRequest();
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [clearPopupRequest, popupRequest, setPopup]);

  return { popup };
};
