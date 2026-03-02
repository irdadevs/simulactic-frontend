import { create } from "zustand";
import { SystemProps } from "../types/system.types";

type SystemsState = {
  systems: SystemProps[];
  selectedSystemId: string | null;
  selectedSystem: SystemProps | null;
  setSystems: (systems: SystemProps[]) => void;
  upsertSystem: (system: SystemProps) => void;
  removeSystem: (systemId: string) => void;
  selectSystem: (systemId: string | null) => void;
  clearSystems: () => void;
};

const initialState = {
  systems: [],
  selectedSystemId: null,
  selectedSystem: null,
};

export const useSystemsStore = create<SystemsState>((set, get) => ({
  ...initialState,

  setSystems: (systems) =>
    set((state) => ({
      systems,
      selectedSystem:
        state.selectedSystemId != null
          ? systems.find((item) => item.id === state.selectedSystemId) ?? null
          : null,
    })),

  upsertSystem: (system) =>
    set((state) => {
      const exists = state.systems.some((item) => item.id === system.id);
      const systems = exists
        ? state.systems.map((item) => (item.id === system.id ? system : item))
        : [system, ...state.systems];

      return {
        systems,
        selectedSystem: state.selectedSystemId === system.id ? system : state.selectedSystem,
      };
    }),

  removeSystem: (systemId) =>
    set((state) => {
      const systems = state.systems.filter((item) => item.id !== systemId);
      const isSelected = state.selectedSystemId === systemId;
      return {
        systems,
        selectedSystemId: isSelected ? null : state.selectedSystemId,
        selectedSystem: isSelected ? null : state.selectedSystem,
      };
    }),

  selectSystem: (systemId) =>
    set(() => ({
      selectedSystemId: systemId,
      selectedSystem:
        systemId == null ? null : get().systems.find((item) => item.id === systemId) ?? null,
    })),

  clearSystems: () => set({ ...initialState }),
}));
