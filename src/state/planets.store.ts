import { create } from "zustand";
import { PlanetProps } from "../types/planet.types";

type PlanetsState = {
  planets: PlanetProps[];
  selectedPlanetId: string | null;
  selectedPlanet: PlanetProps | null;
  setPlanets: (planets: PlanetProps[]) => void;
  upsertPlanet: (planet: PlanetProps) => void;
  removePlanet: (planetId: string) => void;
  selectPlanet: (planetId: string | null) => void;
  clearPlanets: () => void;
};

const initialState = {
  planets: [],
  selectedPlanetId: null,
  selectedPlanet: null,
};

export const usePlanetsStore = create<PlanetsState>((set, get) => ({
  ...initialState,

  setPlanets: (planets) =>
    set((state) => ({
      planets,
      selectedPlanet:
        state.selectedPlanetId != null
          ? planets.find((item) => item.id === state.selectedPlanetId) ?? null
          : null,
    })),

  upsertPlanet: (planet) =>
    set((state) => {
      const exists = state.planets.some((item) => item.id === planet.id);
      const planets = exists
        ? state.planets.map((item) => (item.id === planet.id ? planet : item))
        : [planet, ...state.planets];
      return {
        planets,
        selectedPlanet: state.selectedPlanetId === planet.id ? planet : state.selectedPlanet,
      };
    }),

  removePlanet: (planetId) =>
    set((state) => {
      const planets = state.planets.filter((item) => item.id !== planetId);
      const isSelected = state.selectedPlanetId === planetId;
      return {
        planets,
        selectedPlanetId: isSelected ? null : state.selectedPlanetId,
        selectedPlanet: isSelected ? null : state.selectedPlanet,
      };
    }),

  selectPlanet: (planetId) =>
    set(() => ({
      selectedPlanetId: planetId,
      selectedPlanet:
        planetId == null ? null : get().planets.find((item) => item.id === planetId) ?? null,
    })),

  clearPlanets: () => set({ ...initialState }),
}));
