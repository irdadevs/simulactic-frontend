import { DomainError } from "../../lib/errors/Errors.base";
import { parseDateOrThrow } from "../../lib/date/parseDate";

describe("parseDateOrThrow", () => {
  it("returns the same Date instance when value is already a Date", () => {
    const input = new Date("2026-03-08T00:00:00.000Z");
    const parsed = parseDateOrThrow(input, "createdAt");

    expect(parsed).toBe(input);
    expect(parsed.toISOString()).toBe("2026-03-08T00:00:00.000Z");
  });

  it("parses valid ISO date strings", () => {
    const parsed = parseDateOrThrow("2026-03-08T10:11:12.000Z", "updatedAt");
    expect(parsed).toBeInstanceOf(Date);
    expect(parsed.toISOString()).toBe("2026-03-08T10:11:12.000Z");
  });

  it("throws DOMAIN.INVALID_DATE for invalid inputs", () => {
    try {
      parseDateOrThrow("not-a-date", "createdAt");
      fail("Expected error was not thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_DATE");
    }
  });
});
