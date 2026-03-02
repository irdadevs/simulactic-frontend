import { ZodError } from "zod";
import {
  authUserEnvelopeSchema,
  parseAuthUserEnvelope,
} from "../../infra/api/auth.api";

describe("Auth response contract", () => {
  it("accepts secure user payload for login/signup", () => {
    const parsed = parseAuthUserEnvelope({
      user: {
        id: "11111111-1111-4111-8111-111111111111",
        email: "pilot@example.com",
        username: "pilot_1",
        role: "User",
        verified: false,
        isDeleted: false,
        isArchived: false,
        isSupporter: false,
        createdAt: "2026-02-20T00:00:00.000Z",
        lastActivityAt: "2026-02-21T00:00:00.000Z",
        verifiedAt: null,
        deletedAt: null,
        archivedAt: null,
        supporterFrom: null,
      },
    });

    expect(parsed).toEqual({
      user: {
        id: "11111111-1111-4111-8111-111111111111",
        email: "pilot@example.com",
        username: "pilot_1",
        role: "User",
        verified: false,
        isDeleted: false,
        isArchived: false,
        isSupporter: false,
        createdAt: "2026-02-20T00:00:00.000Z",
        lastActivityAt: "2026-02-21T00:00:00.000Z",
        verifiedAt: null,
        deletedAt: null,
        archivedAt: null,
        supporterFrom: null,
      },
    });
  });

  it("rejects extra user fields", () => {
    expect(() =>
      authUserEnvelopeSchema.parse({
        user: {
          id: "11111111-1111-4111-8111-111111111111",
          email: "pilot@example.com",
          username: "pilot_2",
          role: "Admin",
          verified: true,
          isDeleted: false,
          isArchived: false,
          isSupporter: false,
          createdAt: "2026-02-20T00:00:00.000Z",
          lastActivityAt: "2026-02-21T00:00:00.000Z",
          verifiedAt: null,
          deletedAt: null,
          archivedAt: null,
          supporterFrom: null,
          passwordHash: "should-never-be-exposed",
        },
      }),
    ).toThrow(ZodError);
  });
});
