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
  provider: PaymentProvider;
  providerSessionId: string;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
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
  provider?: PaymentProvider;
  providerSessionId: string;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
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
  provider: PaymentProvider;
  provider_session_id: string;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  current_period_start: Date | null;
  current_period_end: Date | null;
  created_at: Date;
  updated_at: Date;
  canceled_at: Date | null;
};

export type DonationApiResponse = {
  id: string;
  user_id: string;
  donation_type: DonationType;
  amount_minor: number;
  currency: string;
  status: DonationStatus;
  provider: PaymentProvider;
  provider_session_id: string;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  current_period_start: string | Date | null;
  current_period_end: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
  canceled_at: string | Date | null;
};
