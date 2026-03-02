import { create } from "zustand";
import { StarProps } from "../types/star.types";

type StarsState = {
  stars: StarProps[];
  selectedStarId: string | null;
  selectedStar: StarProps | null;
  setStars: (stars: StarProps[]) => void;
  upsertStar: (star: StarProps) => void;
  removeStar: (starId: string) => void;
  selectStar: (starId: string | null) => void;
  clearStars: () => void;
};

const initialState = {
  stars: [],
  selectedStarId: null,
  selectedStar: null,
};

export const useStarsStore = create<StarsState>((set, get) => ({
  ...initialState,

  setStars: (stars) =>
    set((state) => ({
      stars,
      selectedStar:
        state.selectedStarId != null
          ? stars.find((item) => item.id === state.selectedStarId) ?? null
          : null,
    })),

  upsertStar: (star) =>
    set((state) => {
      const exists = state.stars.some((item) => item.id === star.id);
      const stars = exists
        ? state.stars.map((item) => (item.id === star.id ? star : item))
        : [star, ...state.stars];
      return {
        stars,
        selectedStar: state.selectedStarId === star.id ? star : state.selectedStar,
      };
    }),

  removeStar: (starId) =>
    set((state) => {
      const stars = state.stars.filter((item) => item.id !== starId);
      const isSelected = state.selectedStarId === starId;
      return {
        stars,
        selectedStarId: isSelected ? null : state.selectedStarId,
        selectedStar: isSelected ? null : state.selectedStar,
      };
    }),

  selectStar: (starId) =>
    set(() => ({
      selectedStarId: starId,
      selectedStar: starId == null ? null : get().stars.find((item) => item.id === starId) ?? null,
    })),

  clearStars: () => set({ ...initialState }),
}));

