export type DonationType = "one_time" | "monthly";

export type DonationStatus =
  | "pending"
  | "active"
  | "completed"
  | "canceled"
  | "failed"
  | "expired";

export type PaymentProvider = "stripe";

export type DonationProps = {
  id: string;
  userId: string;
  donationType: DonationType;
  amountMinor: number;
  currency: string;
  status: DonationStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
  canceledAt: Date | null;
};

export type DonationCreateProps = {
  id?: string;
  userId: string;
  donationType: DonationType;
  amountMinor: number;
  currency: string;
  status?: DonationStatus;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  canceledAt?: Date | null;
};

export type DonationDTO = {
  id: string;
  user_id: string;
  donation_type: DonationType;
  amount_minor: number;
  currency: string;
  status: DonationStatus;
  current_period_start: Date | null;
  current_period_end: Date | null;
  created_at: Date;
  updated_at: Date;
  canceled_at: Date | null;
};

export type DonationApiResponse = {
  id: string;
  userId: string;
  donationType: DonationType;
  amountMinor: number;
  currency: string;
  status: DonationStatus;
  currentPeriodStart: string | Date | null;
  currentPeriodEnd: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  canceledAt: string | Date | null;
};
