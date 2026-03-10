import { create } from "zustand";
import { AsteroidProps } from "../types/asteroid.types";
import { GalaxyProps } from "../types/galaxy.types";
import { MoonProps } from "../types/moon.types";
import { PlanetProps } from "../types/planet.types";
import { StarProps } from "../types/star.types";
import { SystemProps } from "../types/system.types";

export type PopupPayload =
  | { kind: "galaxy"; data: GalaxyProps }
  | {
      kind: "system";
      data: {
        system: SystemProps;
        stars: StarProps[];
        planets: Array<{
          planet: PlanetProps;
          moons: MoonProps[];
        }>;
        asteroids: AsteroidProps[];
      };
    }
  | { kind: "star"; data: StarProps }
  | {
      kind: "planet";
      data: {
        planet: PlanetProps;
        moons: MoonProps[];
      };
    }
  | { kind: "moon"; data: MoonProps }
  | { kind: "asteroid"; data: AsteroidProps };

export type PopupRequest =
  | { kind: "system"; systemId: string }
  | { kind: "star"; systemId: string; starId: string }
  | { kind: "planet"; planetId: string }
  | { kind: "moon"; moonId: string }
  | { kind: "asteroid"; asteroidId: string };

export type PopupAnchor = {
  x: number;
  y: number;
};

export type SystemNavigationTarget = {
  kind: "star" | "planet" | "moon" | "asteroid";
  id: string;
};

export type SystemTimeConfig = {
  isPlaying: boolean;
  speed: 0.5 | 1 | 2;
};

type UiState = {
  isSidebarOpen: boolean;
  isInspectorOpen: boolean;
  popup: PopupPayload | null;
  popupRequest: PopupRequest | null;
  popupAnchor: PopupAnchor | null;
  popupPinned: boolean;
  popupLoading: boolean;
  navigateToSystemTarget: ((target: SystemNavigationTarget) => void) | null;
  applySystemTimeConfig: ((config: SystemTimeConfig) => void) | null;
  systemTimeConfig: SystemTimeConfig;
  loadingMessage: string | null;
  setSidebarOpen: (open: boolean) => void;
  setInspectorOpen: (open: boolean) => void;
  setPopup: (popup: PopupPayload | null) => void;
  setPopupAnchor: (anchor: PopupAnchor | null) => void;
  setPopupPinned: (pinned: boolean) => void;
  setPopupLoading: (loading: boolean) => void;
  setNavigateToSystemTarget: (
    navigate: ((target: SystemNavigationTarget) => void) | null,
  ) => void;
  setApplySystemTimeConfig: (
    apply: ((config: SystemTimeConfig) => void) | null,
  ) => void;
  setSystemTimePlaying: (isPlaying: boolean) => void;
  setSystemTimeSpeed: (speed: 0.5 | 1 | 2) => void;
  openSystemPopup: (systemId: string) => void;
  openStarPopup: (input: { systemId: string; starId: string }) => void;
  openPlanetPopup: (planetId: string) => void;
  openMoonPopup: (moonId: string) => void;
  openAsteroidPopup: (asteroidId: string) => void;
  clearPopupRequest: () => void;
  resetPopupState: () => void;
  setLoadingMessage: (message: string | null) => void;
  closeAllPanels: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  isInspectorOpen: false,
  popup: null,
  popupRequest: null,
  popupAnchor: null,
  popupPinned: false,
  popupLoading: false,
  navigateToSystemTarget: null,
  applySystemTimeConfig: null,
  systemTimeConfig: {
    isPlaying: true,
    speed: 1,
  },
  loadingMessage: null,

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setInspectorOpen: (open) => set({ isInspectorOpen: open }),
  setPopup: (popup) => set({ popup }),
  setPopupAnchor: (popupAnchor) => set({ popupAnchor }),
  setPopupPinned: (popupPinned) => set({ popupPinned }),
  setPopupLoading: (popupLoading) => set({ popupLoading }),
  setNavigateToSystemTarget: (navigateToSystemTarget) => set({ navigateToSystemTarget }),
  setApplySystemTimeConfig: (applySystemTimeConfig) => set({ applySystemTimeConfig }),
  setSystemTimePlaying: (isPlaying) =>
    set((state) => ({
      systemTimeConfig: {
        ...state.systemTimeConfig,
        isPlaying,
      },
    })),
  setSystemTimeSpeed: (speed) =>
    set((state) => ({
      systemTimeConfig: {
        ...state.systemTimeConfig,
        speed,
      },
    })),
  openSystemPopup: (systemId) =>
    set((state) => {
      const current = state.popupRequest;
      if (state.popup?.kind === "system" && state.popup.data.system.id === systemId) return state;
      if (current?.kind === "system" && current.systemId === systemId) return state;
      return { popupRequest: { kind: "system", systemId } };
    }),
  openStarPopup: ({ systemId, starId }) =>
    set((state) => {
      const current = state.popupRequest;
      if (state.popup?.kind === "star" && state.popup.data.id === starId) return state;
      if (
        current?.kind === "star" &&
        current.systemId === systemId &&
        current.starId === starId
      ) {
        return state;
      }
      return { popupRequest: { kind: "star", systemId, starId } };
    }),
  openPlanetPopup: (planetId) =>
    set((state) => {
      const current = state.popupRequest;
      if (state.popup?.kind === "planet" && state.popup.data.planet.id === planetId) return state;
      if (current?.kind === "planet" && current.planetId === planetId) return state;
      return { popupRequest: { kind: "planet", planetId } };
    }),
  openMoonPopup: (moonId) =>
    set((state) => {
      const current = state.popupRequest;
      if (state.popup?.kind === "moon" && state.popup.data.id === moonId) return state;
      if (current?.kind === "moon" && current.moonId === moonId) return state;
      return { popupRequest: { kind: "moon", moonId } };
    }),
  openAsteroidPopup: (asteroidId) =>
    set((state) => {
      const current = state.popupRequest;
      if (state.popup?.kind === "asteroid" && state.popup.data.id === asteroidId) return state;
      if (current?.kind === "asteroid" && current.asteroidId === asteroidId) return state;
      return { popupRequest: { kind: "asteroid", asteroidId } };
    }),
  clearPopupRequest: () => set({ popupRequest: null }),
  resetPopupState: () =>
    set({
      popup: null,
      popupRequest: null,
      popupAnchor: null,
      popupPinned: false,
      popupLoading: false,
    }),
  setLoadingMessage: (message) => set({ loadingMessage: message }),

  closeAllPanels: () =>
    set({
      isSidebarOpen: false,
      isInspectorOpen: false,
      popup: null,
      popupRequest: null,
      popupAnchor: null,
      popupPinned: false,
      popupLoading: false,
      systemTimeConfig: {
        isPlaying: true,
        speed: 1,
      },
    }),
}));
