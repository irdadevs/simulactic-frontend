import { DonationApiResponse, DonationStatus, DonationType } from "../../types/donation.types";
import { apiGet, apiPost, ApiListResponse } from "./client";

export type SupporterBadgeCatalogItemResponse = {
  id: number;
  branch: "amount" | "months";
  level: number;
  name: string;
  quantityLabel: string;
  threshold: number;
};

export type CreateDonationCheckoutRequest = {
  donationType: DonationType;
  amountMinor: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
};

export type CreateDonationCheckoutResponse = {
  checkoutUrl: string;
  donationId: string;
  sessionId: string;
};

export type ListDonationsQuery = {
  userId?: string;
  donationType?: DonationType;
  status?: DonationStatus;
  limit?: number;
  offset?: number;
  orderBy?: "createdAt" | "updatedAt" | "amountMinor";
  orderDir?: "asc" | "desc";
  view?: "dashboard";
};

const BASE = "/donations";

export const donationApi = {
  createCheckout: (body: CreateDonationCheckoutRequest): Promise<CreateDonationCheckoutResponse> =>
    apiPost(`${BASE}/checkout`, { body }),

  confirmBySession: (sessionId: string): Promise<void> =>
    apiPost(`${BASE}/checkout/${encodeURIComponent(sessionId)}/confirm`),

  cancel: (id: string): Promise<void> => apiPost(`${BASE}/${encodeURIComponent(id)}/cancel`),

  list: (query?: ListDonationsQuery): Promise<ApiListResponse<DonationApiResponse>> =>
    apiGet(`${BASE}`, { query }),

  listBadges: (): Promise<ApiListResponse<SupporterBadgeCatalogItemResponse>> =>
    apiGet(`${BASE}/badges`),

  findById: (id: string, view?: "dashboard"): Promise<DonationApiResponse> =>
    apiGet(`${BASE}/${encodeURIComponent(id)}`, view ? { query: { view } } : undefined),
};
