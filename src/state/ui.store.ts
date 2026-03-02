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

type UiState = {
  isSidebarOpen: boolean;
  isInspectorOpen: boolean;
  popup: PopupPayload | null;
  loadingMessage: string | null;
  setSidebarOpen: (open: boolean) => void;
  setInspectorOpen: (open: boolean) => void;
  setPopup: (popup: PopupPayload | null) => void;
  setLoadingMessage: (message: string | null) => void;
  closeAllPanels: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  isInspectorOpen: false,
  popup: null,
  loadingMessage: null,

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setInspectorOpen: (open) => set({ isInspectorOpen: open }),
  setPopup: (popup) => set({ popup }),
  setLoadingMessage: (message) => set({ loadingMessage: message }),

  closeAllPanels: () =>
    set({
      isSidebarOpen: false,
      isInspectorOpen: false,
      popup: null,
    }),
}));
