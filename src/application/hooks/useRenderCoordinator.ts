import { useCallback, useEffect, useMemo } from "react";
import {
  SerializedGalaxyViewData,
  SerializedSystemViewData,
} from "../../3d/core/serialized.types";
import { useRenderStore } from "../../state/render.store";
import { AsteroidSize } from "../../types/asteroid.types";
import { useGalaxyView } from "./useGalaxyView";
import { useSystemView } from "./useSystemView";

const asteroidSizeMap: Record<AsteroidSize, number> = {
  small: 0.42,
  medium: 0.62,
  big: 0.9,
  massive: 1.28,
};

export const useRenderCoordinator = () => {
  const machineState = useRenderStore((state) => state.machineState);
  const viewMode = useRenderStore((state) => state.viewMode);
  const activeSystemId = useRenderStore((state) => state.activeSystemId);
  const lastSystemId = useRenderStore((state) => state.lastSystemId);
  const galaxyNodes = useRenderStore((state) => state.galaxyNodes);
  const systemDetail = useRenderStore((state) => state.systemDetail);
  const transitionToken = useRenderStore((state) => state.transitionToken);
  const zoom = useRenderStore((state) => state.zoom);

  const setZoom = useRenderStore((state) => state.setZoom);
  const initializeGalaxy = useRenderStore((state) => state.initializeGalaxy);
  const commitGalaxyTransition = useRenderStore((state) => state.commitGalaxyTransition);
  const failTransition = useRenderStore((state) => state.failTransition);
  const requestGalaxyTransition = useRenderStore((state) => state.requestGalaxyTransition);
  const commitSystemTransition = useRenderStore((state) => state.commitSystemTransition);

  const { loadGalaxyView } = useGalaxyView();
  const { loadSystemView } = useSystemView();

  const loadGalaxyForRender = useCallback(
    async (galaxyId: string) => {
      const nodes = await loadGalaxyView(galaxyId);
      initializeGalaxy({ galaxyId, nodes });
    },
    [initializeGalaxy, loadGalaxyView],
  );

  useEffect(() => {
    if (machineState !== "system_loading" || !activeSystemId) return;
    let cancelled = false;
    const token = transitionToken;

    const run = async () => {
      try {
        const detail = await loadSystemView(activeSystemId);
        if (cancelled) return;
        if (!detail) {
          failTransition();
          return;
        }

        const current = useRenderStore.getState();
        if (current.machineState !== "system_loading" || current.transitionToken !== token) {
          return;
        }
        commitSystemTransition(detail);
      } catch {
        if (!cancelled) failTransition();
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [activeSystemId, commitSystemTransition, failTransition, loadSystemView, machineState, transitionToken]);

  useEffect(() => {
    if (machineState !== "galaxy_loading") return;
    commitGalaxyTransition();
  }, [commitGalaxyTransition, machineState]);

  const serializedGalaxyData = useMemo<SerializedGalaxyViewData>(
    () => ({
      systems: galaxyNodes.map((node) => ({
        systemId: node.system.id,
        position: node.system.position,
        color: node.mainStar?.color,
        size: Math.max(1.2, Math.min(8, (node.mainStar?.relativeRadius ?? 1.2) * 3)),
      })),
      focusSystemId: lastSystemId,
    }),
    [galaxyNodes, lastSystemId],
  );

  const serializedSystemData = useMemo<SerializedSystemViewData | null>(() => {
    if (!systemDetail) return null;

    return {
      systemId: systemDetail.system.id,
      stars: systemDetail.stars.map((star) => ({
        starId: star.id,
        isMain: star.isMain,
        orbital: star.orbital,
        size: Math.max(star.relativeRadius, 0.6),
        color: star.color,
      })),
      planets: systemDetail.planets.map((entry) => ({
        planetId: entry.planet.id,
        orbital: entry.planet.orbital,
        size: Math.max(0.4, Math.min(4.2, entry.planet.relativeRadius)),
        moons: entry.moons.map((moon) => ({
          moonId: moon.id,
          orbital: moon.orbital,
          size: Math.max(0.18, Math.min(1.8, moon.relativeRadius * 0.85)),
        })),
      })),
      asteroids: systemDetail.asteroids.map((asteroid) => ({
        asteroidId: asteroid.id,
        orbital: asteroid.orbital,
        size: asteroidSizeMap[asteroid.size],
        type: asteroid.type,
      })),
    };
  }, [systemDetail]);

  const onWheelZoom = useCallback(
    (deltaY: number) => {
      const nextZoom = Math.max(0.4, Math.min(3, zoom + (deltaY > 0 ? 0.08 : -0.08)));
      setZoom(nextZoom);

      // Return to galaxy only when user zooms out far enough while in system view.
      if (viewMode === "system" && deltaY > 0 && nextZoom >= 2.2) {
        requestGalaxyTransition("zoom_threshold");
      }
    },
    [requestGalaxyTransition, setZoom, viewMode, zoom],
  );

  return {
    machineState,
    viewMode,
    activeSystemId,
    zoom,
    serializedGalaxyData,
    serializedSystemData,
    loadGalaxyForRender,
    onWheelZoom,
  };
};
