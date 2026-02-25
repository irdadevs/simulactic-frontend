import { parseDateOrThrow } from "../../lib/date/parseDate";
import { User } from "./User.aggregate";
import { UserApiResponse, UserDTO, UserProps } from "./types";

const parseOptionalDate = (value: string | Date | null, field: string): Date | null => {
  if (!value) {
    return null;
  }
  return parseDateOrThrow(value, field);
};

export const mapUserApiToDomain = (input: UserApiResponse): User =>
  User.rehydrate({
    id: input.id,
    email: input.email,
    passwordHash: input.password,
    username: input.username,
    isVerified: input.is_verified,
    verificationCode: input.verification_code,
    verificationCodeExpiresAt: parseOptionalDate(
      input.verification_code_expires_at,
      "verification_code_expires_at",
    ),
    verifiedAt: parseOptionalDate(input.verified_at, "verified_at"),
    isDeleted: input.is_deleted,
    isArchived: input.is_archived,
    isSupporter: input.is_supporter,
    supporterFrom: parseOptionalDate(input.supporter_from, "supporter_from"),
    role: input.role,
    deletedAt: parseOptionalDate(input.deleted_at, "deleted_at"),
    archivedAt: parseOptionalDate(input.archived_at, "archived_at"),
    lastActivityAt: parseDateOrThrow(input.last_activity_at, "last_activity_at"),
    createdAt: parseDateOrThrow(input.created_at, "created_at"),
  });

export const mapUserDomainToDTO = (user: User): UserDTO => user.toDB();

export const mapUserDomainToView = (user: User): UserProps => user.toJSON();
