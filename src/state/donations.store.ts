import { create } from "zustand";
import { DonationProps } from "../types/donation.types";

type DonationsState = {
  donations: DonationProps[];
  selectedDonationId: string | null;
  selectedDonation: DonationProps | null;
  setDonations: (donations: DonationProps[]) => void;
  upsertDonation: (donation: DonationProps) => void;
  removeDonation: (donationId: string) => void;
  selectDonation: (donationId: string | null) => void;
  clearDonations: () => void;
};

const initialState = {
  donations: [],
  selectedDonationId: null,
  selectedDonation: null,
};

export const useDonationsStore = create<DonationsState>((set, get) => ({
  ...initialState,

  setDonations: (donations) =>
    set((state) => ({
      donations,
      selectedDonation:
        state.selectedDonationId != null
          ? donations.find((item) => item.id === state.selectedDonationId) ?? null
          : null,
    })),

  upsertDonation: (donation) =>
    set((state) => {
      const exists = state.donations.some((item) => item.id === donation.id);
      const donations = exists
        ? state.donations.map((item) => (item.id === donation.id ? donation : item))
        : [donation, ...state.donations];
      return {
        donations,
        selectedDonation:
          state.selectedDonationId === donation.id ? donation : state.selectedDonation,
      };
    }),

  removeDonation: (donationId) =>
    set((state) => {
      const donations = state.donations.filter((item) => item.id !== donationId);
      const isSelected = state.selectedDonationId === donationId;
      return {
        donations,
        selectedDonationId: isSelected ? null : state.selectedDonationId,
        selectedDonation: isSelected ? null : state.selectedDonation,
      };
    }),

  selectDonation: (donationId) =>
    set(() => ({
      selectedDonationId: donationId,
      selectedDonation:
        donationId == null
          ? null
          : get().donations.find((item) => item.id === donationId) ?? null,
    })),

  clearDonations: () => set({ ...initialState }),
}));
