import { create } from "zustand";
import { MoonProps } from "../types/moon.types";

type MoonsState = {
  moons: MoonProps[];
  selectedMoonId: string | null;
  selectedMoon: MoonProps | null;
  setMoons: (moons: MoonProps[]) => void;
  upsertMoon: (moon: MoonProps) => void;
  removeMoon: (moonId: string) => void;
  selectMoon: (moonId: string | null) => void;
  clearMoons: () => void;
};

const initialState = {
  moons: [],
  selectedMoonId: null,
  selectedMoon: null,
};

export const useMoonsStore = create<MoonsState>((set, get) => ({
  ...initialState,

  setMoons: (moons) =>
    set((state) => ({
      moons,
      selectedMoon:
        state.selectedMoonId != null
          ? moons.find((item) => item.id === state.selectedMoonId) ?? null
          : null,
    })),

  upsertMoon: (moon) =>
    set((state) => {
      const exists = state.moons.some((item) => item.id === moon.id);
      const moons = exists
        ? state.moons.map((item) => (item.id === moon.id ? moon : item))
        : [moon, ...state.moons];
      return {
        moons,
        selectedMoon: state.selectedMoonId === moon.id ? moon : state.selectedMoon,
      };
    }),

  removeMoon: (moonId) =>
    set((state) => {
      const moons = state.moons.filter((item) => item.id !== moonId);
      const isSelected = state.selectedMoonId === moonId;
      return {
        moons,
        selectedMoonId: isSelected ? null : state.selectedMoonId,
        selectedMoon: isSelected ? null : state.selectedMoon,
      };
    }),

  selectMoon: (moonId) =>
    set(() => ({
      selectedMoonId: moonId,
      selectedMoon: moonId == null ? null : get().moons.find((item) => item.id === moonId) ?? null,
    })),

  clearMoons: () => set({ ...initialState }),
}));
