import { DomainError } from "../../lib/errors/Errors.base";
import { User } from "../../domain/user/User.aggregate";
import { Email, Role } from "../../domain/user/User.vo";
import {
  mapUserApiToDomain,
  mapUserDomainToDTO,
  mapUserDomainToView,
} from "../../domain/user/mappers";

describe("User aggregate", () => {
  const userId = "11111111-1111-4111-8111-111111111111";

  it("creates and mutates lifecycle state", () => {
    const createdAt = new Date("2026-02-20T00:00:00.000Z");
    const lastActivityAt = new Date("2026-02-21T00:00:00.000Z");
    const aggregate = User.create({
      id: userId,
      email: "test@example.com",
      username: "pilot_1",
      role: "User",
      verified: false,
      isDeleted: false,
      isArchived: false,
      isSupporter: false,
      createdAt,
      lastActivityAt,
      verifiedAt: null,
      deletedAt: null,
      archivedAt: null,
      supporterFrom: null,
    });

    aggregate.changeEmail("new@example.com");
    aggregate.changeRole("Admin");
    aggregate.markVerified();

    expect(aggregate.toJSON()).toEqual({
      id: userId,
      email: "new@example.com",
      username: "pilot_1",
      role: "Admin",
      verified: true,
      isDeleted: false,
      isArchived: false,
      isSupporter: false,
      createdAt,
      lastActivityAt,
      verifiedAt: expect.any(Date),
      deletedAt: null,
      archivedAt: null,
      supporterFrom: null,
    });
  });

  it("maps api/domain/dto", () => {
    const aggregate = mapUserApiToDomain({
      id: userId,
      email: "test@example.com",
      username: "pilot_2",
      role: "User",
      verified: false,
      isDeleted: false,
      isArchived: false,
      isSupporter: true,
      createdAt: "2026-02-20T00:00:00.000Z",
      lastActivityAt: "2026-02-21T00:00:00.000Z",
      verifiedAt: null,
      deletedAt: null,
      archivedAt: null,
      supporterFrom: "2026-02-22T00:00:00.000Z",
    });

    expect(mapUserDomainToView(aggregate)).toEqual({
      id: userId,
      email: "test@example.com",
      username: "pilot_2",
      role: "User",
      verified: false,
      isDeleted: false,
      isArchived: false,
      isSupporter: true,
      createdAt: new Date("2026-02-20T00:00:00.000Z"),
      lastActivityAt: new Date("2026-02-21T00:00:00.000Z"),
      verifiedAt: null,
      deletedAt: null,
      archivedAt: null,
      supporterFrom: new Date("2026-02-22T00:00:00.000Z"),
    });

    expect(mapUserDomainToDTO(aggregate)).toEqual({
      id: userId,
      email: "test@example.com",
      username: "pilot_2",
      role: "User",
      verified: false,
      is_deleted: false,
      is_archived: false,
      is_supporter: true,
      created_at: new Date("2026-02-20T00:00:00.000Z"),
      last_activity_at: new Date("2026-02-21T00:00:00.000Z"),
      verified_at: null,
      deleted_at: null,
      archived_at: null,
      supporter_from: new Date("2026-02-22T00:00:00.000Z"),
    });
  });
});

describe("User value objects", () => {
  it("validates email and role", () => {
    expect(Email.create("  TEST@EXAMPLE.COM ").toString()).toBe("test@example.com");
    expect(Role.create("Admin").toString()).toBe("Admin");
  });

  it("throws on invalid role", () => {
    try {
      Role.create("Root" as never);
      fail("Expected error was not thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_USER_ROLE");
    }
  });
});
