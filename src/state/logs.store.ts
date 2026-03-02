import { create } from "zustand";
import { LogProps } from "../types/log.types";

type LogsState = {
  logs: LogProps[];
  selectedLogId: string | null;
  selectedLog: LogProps | null;
  setLogs: (logs: LogProps[]) => void;
  upsertLog: (log: LogProps) => void;
  removeLog: (logId: string) => void;
  selectLog: (logId: string | null) => void;
  clearLogs: () => void;
};

const initialState = {
  logs: [],
  selectedLogId: null,
  selectedLog: null,
};

export const useLogsStore = create<LogsState>((set, get) => ({
  ...initialState,

  setLogs: (logs) =>
    set((state) => ({
      logs,
      selectedLog:
        state.selectedLogId != null
          ? logs.find((item) => item.id === state.selectedLogId) ?? null
          : null,
    })),

  upsertLog: (log) =>
    set((state) => {
      const exists = state.logs.some((item) => item.id === log.id);
      const logs = exists
        ? state.logs.map((item) => (item.id === log.id ? log : item))
        : [log, ...state.logs];
      return {
        logs,
        selectedLog: state.selectedLogId === log.id ? log : state.selectedLog,
      };
    }),

  removeLog: (logId) =>
    set((state) => {
      const logs = state.logs.filter((item) => item.id !== logId);
      const isSelected = state.selectedLogId === logId;
      return {
        logs,
        selectedLogId: isSelected ? null : state.selectedLogId,
        selectedLog: isSelected ? null : state.selectedLog,
      };
    }),

  selectLog: (logId) =>
    set(() => ({
      selectedLogId: logId,
      selectedLog: logId == null ? null : get().logs.find((item) => item.id === logId) ?? null,
    })),

  clearLogs: () => set({ ...initialState }),
}));
