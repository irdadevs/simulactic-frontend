import { publicEnv } from "../config/env";

type LogLevel = "error" | "warn" | "info" | "debug";

const weights: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const enabled = (level: LogLevel) => weights[level] <= weights[publicEnv.logLevel];

export const logger = {
  error: (...args: unknown[]) => {
    if (enabled("error")) console.error(...args);
  },
  warn: (...args: unknown[]) => {
    if (enabled("warn")) console.warn(...args);
  },
  info: (...args: unknown[]) => {
    if (enabled("info")) console.info(...args);
  },
  debug: (...args: unknown[]) => {
    if (enabled("debug")) console.debug(...args);
  },
};
