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

type UiState = {
  isSidebarOpen: boolean;
  isInspectorOpen: boolean;
  popup: PopupPayload | null;
  popupRequest: PopupRequest | null;
  loadingMessage: string | null;
  setSidebarOpen: (open: boolean) => void;
  setInspectorOpen: (open: boolean) => void;
  setPopup: (popup: PopupPayload | null) => void;
  openSystemPopup: (systemId: string) => void;
  openStarPopup: (input: { systemId: string; starId: string }) => void;
  openPlanetPopup: (planetId: string) => void;
  openMoonPopup: (moonId: string) => void;
  openAsteroidPopup: (asteroidId: string) => void;
  clearPopupRequest: () => void;
  setLoadingMessage: (message: string | null) => void;
  closeAllPanels: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  isInspectorOpen: false,
  popup: null,
  popupRequest: null,
  loadingMessage: null,

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setInspectorOpen: (open) => set({ isInspectorOpen: open }),
  setPopup: (popup) => set({ popup }),
  openSystemPopup: (systemId) =>
    set((state) => {
      const current = state.popupRequest;
      if (current?.kind === "system" && current.systemId === systemId) return state;
      return { popupRequest: { kind: "system", systemId } };
    }),
  openStarPopup: ({ systemId, starId }) =>
    set((state) => {
      const current = state.popupRequest;
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
      if (current?.kind === "planet" && current.planetId === planetId) return state;
      return { popupRequest: { kind: "planet", planetId } };
    }),
  openMoonPopup: (moonId) =>
    set((state) => {
      const current = state.popupRequest;
      if (current?.kind === "moon" && current.moonId === moonId) return state;
      return { popupRequest: { kind: "moon", moonId } };
    }),
  openAsteroidPopup: (asteroidId) =>
    set((state) => {
      const current = state.popupRequest;
      if (current?.kind === "asteroid" && current.asteroidId === asteroidId) return state;
      return { popupRequest: { kind: "asteroid", asteroidId } };
    }),
  clearPopupRequest: () => set({ popupRequest: null }),
  setLoadingMessage: (message) => set({ loadingMessage: message }),

  closeAllPanels: () =>
    set({
      isSidebarOpen: false,
      isInspectorOpen: false,
      popup: null,
      popupRequest: null,
    }),
}));
