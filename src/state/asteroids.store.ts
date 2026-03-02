import { create } from "zustand";
import { AsteroidProps } from "../types/asteroid.types";

type AsteroidsState = {
  asteroids: AsteroidProps[];
  selectedAsteroidId: string | null;
  selectedAsteroid: AsteroidProps | null;
  setAsteroids: (asteroids: AsteroidProps[]) => void;
  upsertAsteroid: (asteroid: AsteroidProps) => void;
  removeAsteroid: (asteroidId: string) => void;
  selectAsteroid: (asteroidId: string | null) => void;
  clearAsteroids: () => void;
};

const initialState = {
  asteroids: [],
  selectedAsteroidId: null,
  selectedAsteroid: null,
};

export const useAsteroidsStore = create<AsteroidsState>((set, get) => ({
  ...initialState,

  setAsteroids: (asteroids) =>
    set((state) => ({
      asteroids,
      selectedAsteroid:
        state.selectedAsteroidId != null
          ? asteroids.find((item) => item.id === state.selectedAsteroidId) ?? null
          : null,
    })),

  upsertAsteroid: (asteroid) =>
    set((state) => {
      const exists = state.asteroids.some((item) => item.id === asteroid.id);
      const asteroids = exists
        ? state.asteroids.map((item) => (item.id === asteroid.id ? asteroid : item))
        : [asteroid, ...state.asteroids];
      return {
        asteroids,
        selectedAsteroid:
          state.selectedAsteroidId === asteroid.id ? asteroid : state.selectedAsteroid,
      };
    }),

  removeAsteroid: (asteroidId) =>
    set((state) => {
      const asteroids = state.asteroids.filter((item) => item.id !== asteroidId);
      const isSelected = state.selectedAsteroidId === asteroidId;
      return {
        asteroids,
        selectedAsteroidId: isSelected ? null : state.selectedAsteroidId,
        selectedAsteroid: isSelected ? null : state.selectedAsteroid,
      };
    }),

  selectAsteroid: (asteroidId) =>
    set(() => ({
      selectedAsteroidId: asteroidId,
      selectedAsteroid:
        asteroidId == null ? null : get().asteroids.find((item) => item.id === asteroidId) ?? null,
    })),

  clearAsteroids: () => set({ ...initialState }),
}));
