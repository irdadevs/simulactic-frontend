import { ErrorFactory } from "../../lib/errors/Error.map";
import { LogCategory, LogLevel } from "./types";

export const ALLOWED_LOG_LEVELS: readonly LogLevel[] = [
  "debug",
  "info",
  "warn",
  "error",
  "critical",
] as const;

export const ALLOWED_LOG_CATEGORIES: readonly LogCategory[] = [
  "application",
  "security",
  "audit",
  "infrastructure",
] as const;

export class LogSource {
  private constructor(private readonly value: string) {}

  static create(value: string): LogSource {
    const normalized = value.trim();
    if (!normalized || normalized.length > 80) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", { field: "source" });
    }
    return new LogSource(normalized);
  }

  toString(): string {
    return this.value;
  }
}

export class LogMessage {
  private constructor(private readonly value: string) {}

  static create(value: string): LogMessage {
    const normalized = value.trim();
    if (!normalized || normalized.length > 1000) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", { field: "message" });
    }
    return new LogMessage(normalized);
  }

  toString(): string {
    return this.value;
  }
}
