import { ErrorFactory } from "../../lib/errors/Error.map";
import { DonationStatus, DonationType } from "./types";

export const ALLOWED_DONATION_TYPES: readonly DonationType[] = [
  "one_time",
  "monthly",
] as const;

export const ALLOWED_DONATION_STATUSES: readonly DonationStatus[] = [
  "pending",
  "active",
  "completed",
  "canceled",
  "failed",
  "expired",
] as const;

export class CurrencyCode {
  private constructor(private readonly value: string) {}

  static create(value: string): CurrencyCode {
    const normalized = value.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalized)) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "currency",
      });
    }
    return new CurrencyCode(normalized);
  }

  toString(): string {
    return this.value;
  }
}

export class Money {
  private constructor(private readonly amountMinorValue: number) {}

  static create(amountMinor: number): Money {
    if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "amountMinor",
      });
    }
    return new Money(amountMinor);
  }

  get amountMinor(): number {
    return this.amountMinorValue;
  }
}
