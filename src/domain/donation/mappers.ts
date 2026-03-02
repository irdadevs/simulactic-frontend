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
    userId: input.userId,
    donationType: input.donationType,
    amountMinor: input.amountMinor,
    currency: input.currency,
    status: input.status,
    currentPeriodStart: parseOptionalDate(input.currentPeriodStart, "currentPeriodStart"),
    currentPeriodEnd: parseOptionalDate(input.currentPeriodEnd, "currentPeriodEnd"),
    createdAt: parseDateOrThrow(input.createdAt, "createdAt"),
    updatedAt: parseDateOrThrow(input.updatedAt, "updatedAt"),
    canceledAt: parseOptionalDate(input.canceledAt, "canceledAt"),
  });

export const mapDonationDomainToDTO = (donation: Donation): DonationDTO =>
  donation.toDB();

export const mapDonationDomainToView = (donation: Donation): DonationProps =>
  donation.toJSON();

