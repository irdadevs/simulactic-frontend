import { create } from "zustand";
import { AsteroidProps } from "../types/asteroid.types";
import { MoonProps } from "../types/moon.types";
import { PlanetProps } from "../types/planet.types";
import { StarProps } from "../types/star.types";
import { SystemProps } from "../types/system.types";

export type ViewMode = "galaxy" | "system";
export type RenderMachineState =
  | "idle"
  | "galaxy_ready"
  | "system_loading"
  | "system_ready"
  | "galaxy_loading";
export type RenderTransitionReason = "user_select_system" | "user_back_to_galaxy" | "zoom_threshold";

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
  machineState: RenderMachineState;
  viewMode: ViewMode;
  activeGalaxyId: string | null;
  activeSystemId: string | null;
  galaxyNodes: GalaxyRenderNode[];
  systemDetail: SystemRenderDetail | null;
  zoom: number;
  transitionReason: RenderTransitionReason | null;
  transitionToken: number;
  setViewMode: (mode: ViewMode) => void;
  setActiveGalaxy: (galaxyId: string | null) => void;
  setActiveSystem: (systemId: string | null) => void;
  setGalaxyNodes: (nodes: GalaxyRenderNode[]) => void;
  setSystemDetail: (detail: SystemRenderDetail | null) => void;
  setZoom: (zoom: number) => void;
  initializeGalaxy: (input: { galaxyId: string | null; nodes: GalaxyRenderNode[] }) => void;
  requestSystemTransition: (input: {
    systemId: string;
    reason?: RenderTransitionReason;
  }) => boolean;
  requestSystemTransitionByZoom: (systemId: string) => boolean;
  commitSystemTransition: (detail: SystemRenderDetail) => boolean;
  requestGalaxyTransition: (reason?: RenderTransitionReason) => boolean;
  commitGalaxyTransition: (input?: { nodes?: GalaxyRenderNode[] }) => boolean;
  failTransition: () => void;
  resetRender: () => void;
};

const initialState = {
  machineState: "idle" as RenderMachineState,
  viewMode: "galaxy" as ViewMode,
  activeGalaxyId: null,
  activeSystemId: null,
  galaxyNodes: [],
  systemDetail: null,
  zoom: 1,
  transitionReason: null,
  transitionToken: 0,
};

export const useRenderStore = create<RenderState>((set, get) => ({
  ...initialState,

  setViewMode: (mode) =>
    set({
      viewMode: mode,
      machineState: mode === "galaxy" ? "galaxy_ready" : "system_ready",
    }),
  setActiveGalaxy: (galaxyId) => set({ activeGalaxyId: galaxyId }),
  setActiveSystem: (systemId) => set({ activeSystemId: systemId }),
  setGalaxyNodes: (nodes) =>
    set((state) => ({
      galaxyNodes: nodes,
      machineState: state.viewMode === "galaxy" ? "galaxy_ready" : state.machineState,
    })),
  setSystemDetail: (detail) => set({ systemDetail: detail }),
  setZoom: (zoom) => set({ zoom }),

  initializeGalaxy: ({ galaxyId, nodes }) =>
    set({
      machineState: "galaxy_ready",
      viewMode: "galaxy",
      activeGalaxyId: galaxyId,
      activeSystemId: null,
      galaxyNodes: nodes,
      systemDetail: null,
      transitionReason: null,
    }),

  requestSystemTransition: ({ systemId, reason = "user_select_system" }) => {
    const state = get();
    if (state.machineState !== "galaxy_ready") return false;

    set((prev) => ({
      machineState: "system_loading",
      transitionReason: reason,
      activeSystemId: systemId,
      transitionToken: prev.transitionToken + 1,
      systemDetail: null,
    }));
    return true;
  },

  requestSystemTransitionByZoom: (systemId) => {
    return get().requestSystemTransition({
      systemId,
      reason: "zoom_threshold",
    });
  },

  commitSystemTransition: (detail) => {
    const state = get();
    if (state.machineState !== "system_loading") return false;
    if (state.activeSystemId !== detail.system.id) return false;

    set({
      machineState: "system_ready",
      viewMode: "system",
      systemDetail: detail,
      transitionReason: null,
    });
    return true;
  },

  requestGalaxyTransition: (reason = "user_back_to_galaxy") => {
    const state = get();
    if (state.machineState !== "system_ready") return false;

    set((prev) => ({
      machineState: "galaxy_loading",
      transitionReason: reason,
      transitionToken: prev.transitionToken + 1,
    }));
    return true;
  },

  commitGalaxyTransition: (input) => {
    const state = get();
    if (state.machineState !== "galaxy_loading") return false;

    set({
      machineState: "galaxy_ready",
      viewMode: "galaxy",
      activeSystemId: null,
      systemDetail: null,
      transitionReason: null,
      galaxyNodes: input?.nodes ?? state.galaxyNodes,
    });
    return true;
  },

  failTransition: () =>
    set((state) => {
      if (state.machineState === "system_loading") {
        return {
          machineState: "galaxy_ready" as RenderMachineState,
          activeSystemId: null,
          systemDetail: null,
          transitionReason: null,
        };
      }

      if (state.machineState === "galaxy_loading") {
        return {
          machineState: "system_ready" as RenderMachineState,
          transitionReason: null,
        };
      }

      return {};
    }),

  resetRender: () =>
    set({
      ...initialState,
    }),
}));
