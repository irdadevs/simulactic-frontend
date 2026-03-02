import { create } from "zustand";
import { AsteroidProps } from "../types/asteroid.types";
import { GalaxyProps } from "../types/galaxy.types";
import { MoonProps } from "../types/moon.types";
import { PlanetProps } from "../types/planet.types";
import { StarProps } from "../types/star.types";
import { SystemProps } from "../types/system.types";

export type GalaxyPopulationNode = {
  system: SystemProps;
  stars: StarProps[];
  planets: Array<{
    planet: PlanetProps;
    moons: MoonProps[];
  }>;
  asteroids: AsteroidProps[];
};

export type GalaxyPopulation = {
  galaxy: GalaxyProps;
  systems: GalaxyPopulationNode[];
};

type GalaxyState = {
  galaxies: GalaxyProps[];
  selectedGalaxyId: string | null;
  selectedGalaxy: GalaxyProps | null;
  population: GalaxyPopulation | null;
  setGalaxies: (galaxies: GalaxyProps[]) => void;
  upsertGalaxy: (galaxy: GalaxyProps) => void;
  removeGalaxy: (galaxyId: string) => void;
  selectGalaxy: (galaxyId: string | null) => void;
  setPopulation: (population: GalaxyPopulation | null) => void;
  clear: () => void;
};

const initialState = {
  galaxies: [],
  selectedGalaxyId: null,
  selectedGalaxy: null,
  population: null,
};

export const useGalaxyStore = create<GalaxyState>((set, get) => ({
  ...initialState,

  setGalaxies: (galaxies) =>
    set((state) => {
      const selectedGalaxy =
        state.selectedGalaxyId != null
          ? galaxies.find((item) => item.id === state.selectedGalaxyId) ?? null
          : null;
      return {
        galaxies,
        selectedGalaxy,
      };
    }),

  upsertGalaxy: (galaxy) =>
    set((state) => {
      const exists = state.galaxies.some((item) => item.id === galaxy.id);
      const galaxies = exists
        ? state.galaxies.map((item) => (item.id === galaxy.id ? galaxy : item))
        : [galaxy, ...state.galaxies];

      return {
        galaxies,
        selectedGalaxy: state.selectedGalaxyId === galaxy.id ? galaxy : state.selectedGalaxy,
      };
    }),

  removeGalaxy: (galaxyId) =>
    set((state) => {
      const galaxies = state.galaxies.filter((item) => item.id !== galaxyId);
      const isSelected = state.selectedGalaxyId === galaxyId;
      return {
        galaxies,
        selectedGalaxyId: isSelected ? null : state.selectedGalaxyId,
        selectedGalaxy: isSelected ? null : state.selectedGalaxy,
        population: state.population?.galaxy.id === galaxyId ? null : state.population,
      };
    }),

  selectGalaxy: (galaxyId) =>
    set(() => {
      if (galaxyId == null) {
        return { selectedGalaxyId: null, selectedGalaxy: null };
      }
      const selectedGalaxy = get().galaxies.find((item) => item.id === galaxyId) ?? null;
      return {
        selectedGalaxyId: galaxyId,
        selectedGalaxy,
      };
    }),

  setPopulation: (population) => set({ population }),

  clear: () => set({ ...initialState }),
}));
