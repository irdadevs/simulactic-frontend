import { ErrorFactory } from "../../lib/errors/Error.map";
import { Uuid } from "../shared/Uuid.vo";
import {
  ALLOWED_DONATION_STATUSES,
  ALLOWED_DONATION_TYPES,
  CurrencyCode,
  Money,
} from "./Donation.vo";
import {
  DonationCreateProps,
  DonationDTO,
  DonationProps,
  DonationStatus,
  DonationType,
} from "../../types/donation.types";

type DonationState = {
  id: Uuid;
  userId: Uuid;
  donationType: DonationType;
  amountMinor: number;
  currency: CurrencyCode;
  status: DonationStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
  canceledAt: Date | null;
};

export class Donation {
  private props: DonationState;

  private constructor(props: DonationState) {
    this.props = { ...props };
  }

  static create(input: DonationCreateProps): Donation {
    if (!ALLOWED_DONATION_TYPES.includes(input.donationType)) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "donationType",
      });
    }

    const status = input.status ?? "pending";
    if (!ALLOWED_DONATION_STATUSES.includes(status)) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "status",
      });
    }

    const money = Money.create(input.amountMinor);

    return new Donation({
      id: Uuid.create(input.id),
      userId: Uuid.create(input.userId),
      donationType: input.donationType,
      amountMinor: money.amountMinor,
      currency: CurrencyCode.create(input.currency),
      status,
      currentPeriodStart: input.currentPeriodStart ?? null,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      createdAt: input.createdAt ?? new Date(),
      updatedAt: input.updatedAt ?? new Date(),
      canceledAt: input.canceledAt ?? null,
    });
  }

  static rehydrate(props: DonationProps): Donation {
    return new Donation({
      id: Uuid.create(props.id),
      userId: Uuid.create(props.userId),
      donationType: props.donationType,
      amountMinor: Money.create(props.amountMinor).amountMinor,
      currency: CurrencyCode.create(props.currency),
      status: props.status,
      currentPeriodStart: props.currentPeriodStart,
      currentPeriodEnd: props.currentPeriodEnd,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      canceledAt: props.canceledAt,
    });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get userId(): string {
    return this.props.userId.toString();
  }

  get donationType(): DonationType {
    return this.props.donationType;
  }

  get amountMinor(): number {
    return this.props.amountMinor;
  }

  get currency(): string {
    return this.props.currency.toString();
  }

  get status(): DonationStatus {
    return this.props.status;
  }

  get currentPeriodStart(): Date | null {
    return this.props.currentPeriodStart;
  }

  get currentPeriodEnd(): Date | null {
    return this.props.currentPeriodEnd;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get canceledAt(): Date | null {
    return this.props.canceledAt;
  }

  completeOneTime(): void {
    this.props.status = "completed";
    this.props.updatedAt = new Date();
  }

  activateRecurring(params: {
    currentPeriodStart?: Date | null;
    currentPeriodEnd?: Date | null;
  }): void {
    this.props.status = "active";
    this.props.currentPeriodStart = params.currentPeriodStart ?? null;
    this.props.currentPeriodEnd = params.currentPeriodEnd ?? null;
    this.props.updatedAt = new Date();
  }

  fail(): void {
    this.props.status = "failed";
    this.props.updatedAt = new Date();
  }

  expire(): void {
    this.props.status = "expired";
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    this.props.status = "canceled";
    this.props.canceledAt = new Date();
    this.props.updatedAt = new Date();
  }

  toJSON(): DonationProps {
    return {
      id: this.id,
      userId: this.userId,
      donationType: this.donationType,
      amountMinor: this.amountMinor,
      currency: this.currency,
      status: this.status,
      currentPeriodStart: this.currentPeriodStart,
      currentPeriodEnd: this.currentPeriodEnd,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      canceledAt: this.canceledAt,
    };
  }

  toDB(): DonationDTO {
    return {
      id: this.id,
      user_id: this.userId,
      donation_type: this.donationType,
      amount_minor: this.amountMinor,
      currency: this.currency,
      status: this.status,
      current_period_start: this.currentPeriodStart,
      current_period_end: this.currentPeriodEnd,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      canceled_at: this.canceledAt,
    };
  }
}

