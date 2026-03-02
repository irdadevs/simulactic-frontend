import { DomainError } from "../../lib/errors/Errors.base";
import { Donation } from "../../domain/donation/Donation.aggregate";
import { CurrencyCode, Money } from "../../domain/donation/Donation.vo";
import {
  mapDonationApiToDomain,
  mapDonationDomainToDTO,
  mapDonationDomainToView,
} from "../../domain/donation/mappers";

describe("Donation aggregate", () => {
  const donationId = "11111111-1111-4111-8111-111111111111";
  const userId = "22222222-2222-4222-8222-222222222222";

  it("creates and transitions lifecycle status", () => {
    const aggregate = Donation.create({
      id: donationId,
      userId,
      donationType: "one_time",
      amountMinor: 500,
      currency: "usd",
    });

    aggregate.completeOneTime();
    expect(aggregate.status).toBe("completed");

    aggregate.cancel();
    expect(aggregate.status).toBe("canceled");
    expect(aggregate.canceledAt).toBeInstanceOf(Date);
  });

  it("maps api/domain/dto", () => {
    const aggregate = mapDonationApiToDomain({
      id: donationId,
      userId,
      donationType: "monthly",
      amountMinor: 999,
      currency: "EUR",
      status: "active",
      currentPeriodStart: "2026-02-01T00:00:00.000Z",
      currentPeriodEnd: "2026-03-01T00:00:00.000Z",
      createdAt: "2026-02-01T00:00:00.000Z",
      updatedAt: "2026-02-02T00:00:00.000Z",
      canceledAt: null,
    });

    expect(mapDonationDomainToView(aggregate).currency).toBe("EUR");
    expect(mapDonationDomainToDTO(aggregate).user_id).toBe(userId);
  });

  it("throws on invalid amount", () => {
    try {
      Donation.create({
        userId,
        donationType: "one_time",
        amountMinor: 0,
        currency: "USD",
      });
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("PRESENTATION.INVALID_FIELD");
    }
  });
});

describe("Donation value objects", () => {
  it("validates currency and money", () => {
    expect(CurrencyCode.create(" usd ").toString()).toBe("USD");
    expect(Money.create(1500).amountMinor).toBe(1500);
  });

  it("throws on invalid currency", () => {
    try {
      CurrencyCode.create("US");
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("PRESENTATION.INVALID_FIELD");
    }
  });
});
