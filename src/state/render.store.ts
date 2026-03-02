import { create } from "zustand";
import { AsteroidProps } from "../types/asteroid.types";
import { MoonProps } from "../types/moon.types";
import { PlanetProps } from "../types/planet.types";
import { StarProps } from "../types/star.types";
import { SystemProps } from "../types/system.types";

export type ViewMode = "galaxy" | "system";

export type GalaxyRenderNode = {
  system: SystemProps;
  mainStar: StarProps | null;
  stars: StarProps[];
};

export type SystemRenderDetail = {
  system: SystemProps;
  stars: StarProps[];
  planets: Array<{
    planet: PlanetProps;
    moons: MoonProps[];
  }>;
  asteroids: AsteroidProps[];
};

type RenderState = {
  viewMode: ViewMode;
  activeGalaxyId: string | null;
  activeSystemId: string | null;
  galaxyNodes: GalaxyRenderNode[];
  systemDetail: SystemRenderDetail | null;
  zoom: number;
  setViewMode: (mode: ViewMode) => void;
  setActiveGalaxy: (galaxyId: string | null) => void;
  setActiveSystem: (systemId: string | null) => void;
  setGalaxyNodes: (nodes: GalaxyRenderNode[]) => void;
  setSystemDetail: (detail: SystemRenderDetail | null) => void;
  setZoom: (zoom: number) => void;
  resetRender: () => void;
};

const initialState = {
  viewMode: "galaxy" as ViewMode,
  activeGalaxyId: null,
  activeSystemId: null,
  galaxyNodes: [],
  systemDetail: null,
  zoom: 1,
};

export const useRenderStore = create<RenderState>((set) => ({
  ...initialState,

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveGalaxy: (galaxyId) => set({ activeGalaxyId: galaxyId }),
  setActiveSystem: (systemId) => set({ activeSystemId: systemId }),
  setGalaxyNodes: (nodes) => set({ galaxyNodes: nodes }),
  setSystemDetail: (detail) => set({ systemDetail: detail }),
  setZoom: (zoom) => set({ zoom }),

  resetRender: () =>
    set({
      ...initialState,
    }),
}));
