import { DomainError } from "../../lib/errors/Errors.base";
import { Uuid } from "../../domain/shared/Uuid.vo";

describe("Uuid value object", () => {
  it("creates with explicit id and supports equality", () => {
    const left = Uuid.create("11111111-1111-4111-8111-111111111111");
    const right = Uuid.create("11111111-1111-4111-8111-111111111111");
    const other = Uuid.create("22222222-2222-4222-8222-222222222222");

    expect(left.toString()).toBe("11111111-1111-4111-8111-111111111111");
    expect(left.equals(right)).toBe(true);
    expect(left.equals(other)).toBe(false);
  });

  it("generates a valid uuid when id is omitted", () => {
    const generated = Uuid.create();
    expect(generated.toString()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("throws DOMAIN.INVALID_USER_ID for malformed values", () => {
    try {
      Uuid.create("not-an-id");
      fail("Expected error was not thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_USER_ID");
    }
  });
});
