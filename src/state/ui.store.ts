import { create } from "zustand";
import { AsteroidProps } from "../types/asteroid.types";
import { GalaxyProps } from "../types/galaxy.types";
import { MoonProps } from "../types/moon.types";
import { PlanetProps } from "../types/planet.types";
import { StarProps } from "../types/star.types";
import { SystemProps } from "../types/system.types";

export type PopupPayload =
  | { kind: "galaxy"; data: GalaxyProps }
  | { kind: "system"; data: SystemProps }
  | { kind: "star"; data: StarProps }
  | { kind: "planet"; data: PlanetProps }
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
  openSystemPopup: (systemId) => set({ popupRequest: { kind: "system", systemId } }),
  openStarPopup: ({ systemId, starId }) =>
    set({ popupRequest: { kind: "star", systemId, starId } }),
  openPlanetPopup: (planetId) => set({ popupRequest: { kind: "planet", planetId } }),
  openMoonPopup: (moonId) => set({ popupRequest: { kind: "moon", moonId } }),
  openAsteroidPopup: (asteroidId) => set({ popupRequest: { kind: "asteroid", asteroidId } }),
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
