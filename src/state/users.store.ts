import { create } from "zustand";
import { UserProps } from "../types/user.types";

type UsersState = {
  users: UserProps[];
  selectedUserId: string | null;
  selectedUser: UserProps | null;
  setUsers: (users: UserProps[]) => void;
  upsertUser: (user: UserProps) => void;
  removeUser: (userId: string) => void;
  selectUser: (userId: string | null) => void;
  clearUsers: () => void;
};

const initialState = {
  users: [],
  selectedUserId: null,
  selectedUser: null,
};

export const useUsersStore = create<UsersState>((set, get) => ({
  ...initialState,

  setUsers: (users) =>
    set((state) => ({
      users,
      selectedUser:
        state.selectedUserId != null
          ? users.find((item) => item.id === state.selectedUserId) ?? null
          : null,
    })),

  upsertUser: (user) =>
    set((state) => {
      const exists = state.users.some((item) => item.id === user.id);
      const users = exists
        ? state.users.map((item) => (item.id === user.id ? user : item))
        : [user, ...state.users];
      return {
        users,
        selectedUser: state.selectedUserId === user.id ? user : state.selectedUser,
      };
    }),

  removeUser: (userId) =>
    set((state) => {
      const users = state.users.filter((item) => item.id !== userId);
      const isSelected = state.selectedUserId === userId;
      return {
        users,
        selectedUserId: isSelected ? null : state.selectedUserId,
        selectedUser: isSelected ? null : state.selectedUser,
      };
    }),

  selectUser: (userId) =>
    set(() => ({
      selectedUserId: userId,
      selectedUser: userId == null ? null : get().users.find((item) => item.id === userId) ?? null,
    })),

  clearUsers: () => set({ ...initialState }),
}));
