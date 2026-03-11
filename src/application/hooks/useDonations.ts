import { useCallback, useState } from "react";
import { mapDonationApiToDomain, mapDonationDomainToView } from "../../domain/donation/mappers";
import {
  CreateDonationCheckoutRequest,
  CreateCustomerPortalSessionRequest,
  donationApi,
  ListDonationsQuery,
} from "../../infra/api/donation.api";
import { DonationProps } from "../../types/donation.types";

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const useDonations = () => {
  const [donations, setDonations] = useState<DonationProps[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<DonationProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withLoading = useCallback(async <T,>(work: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      return await work();
    } catch (err: unknown) {
      setError(toErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCheckout = useCallback(
    (body: CreateDonationCheckoutRequest) =>
      withLoading(async () => {
        return donationApi.createCheckout(body);
      }),
    [withLoading],
  );

  const confirmBySession = useCallback(
    (sessionId: string) => withLoading(async () => donationApi.confirmBySession(sessionId)),
    [withLoading],
  );

  const createPortalSession = useCallback(
    (id: string, body: CreateCustomerPortalSessionRequest) =>
      withLoading(async () => donationApi.createPortalSession(id, body)),
    [withLoading],
  );

  const cancel = useCallback(
    (id: string) =>
      withLoading(async () => {
        await donationApi.cancel(id);
        setDonations((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "canceled", canceledAt: new Date() } : item,
          ),
        );
        setSelectedDonation((prev) =>
          prev && prev.id === id ? { ...prev, status: "canceled", canceledAt: new Date() } : prev,
        );
      }),
    [withLoading],
  );

  const list = useCallback(
    (query?: ListDonationsQuery) =>
      withLoading(async () => {
        const result = await donationApi.list(query);
        const rows = result.rows.map((row) =>
          mapDonationDomainToView(mapDonationApiToDomain(row)),
        );
        setDonations(rows);
        return { rows, total: result.total };
      }),
    [withLoading],
  );

  const findById = useCallback(
    (id: string, view?: "dashboard") =>
      withLoading(async () => {
        const result = await donationApi.findById(id, view);
        const mapped = mapDonationDomainToView(mapDonationApiToDomain(result));
        setSelectedDonation(mapped);
        return mapped;
      }),
    [withLoading],
  );

  return {
    donations,
    selectedDonation,
    isLoading,
    error,
    createCheckout,
    createPortalSession,
    confirmBySession,
    cancel,
    list,
    findById,
  };
};
