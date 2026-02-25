import { parseDateOrThrow } from "../../lib/date/parseDate";
import { Donation } from "./Donation.aggregate";
import { DonationApiResponse, DonationDTO, DonationProps } from "../../types/donation.types";

const parseOptionalDate = (value: string | Date | null, field: string): Date | null => {
  if (!value) {
    return null;
  }
  return parseDateOrThrow(value, field);
};

export const mapDonationApiToDomain = (input: DonationApiResponse): Donation =>
  Donation.rehydrate({
    id: input.id,
    userId: input.user_id,
    donationType: input.donation_type,
    amountMinor: input.amount_minor,
    currency: input.currency,
    status: input.status,
    provider: input.provider,
    providerSessionId: input.provider_session_id,
    providerCustomerId: input.provider_customer_id,
    providerSubscriptionId: input.provider_subscription_id,
    currentPeriodStart: parseOptionalDate(
      input.current_period_start,
      "current_period_start",
    ),
    currentPeriodEnd: parseOptionalDate(input.current_period_end, "current_period_end"),
    createdAt: parseDateOrThrow(input.created_at, "created_at"),
    updatedAt: parseDateOrThrow(input.updated_at, "updated_at"),
    canceledAt: parseOptionalDate(input.canceled_at, "canceled_at"),
  });

export const mapDonationDomainToDTO = (donation: Donation): DonationDTO =>
  donation.toDB();

export const mapDonationDomainToView = (donation: Donation): DonationProps =>
  donation.toJSON();

