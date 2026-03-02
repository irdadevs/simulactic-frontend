import { parseDateOrThrow } from "../../lib/date/parseDate";
import { User } from "./User.aggregate";
import { UserApiResponse, UserDTO, UserProps } from "../../types/user.types";

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
    username: input.username,
    role: input.role,
    verified: input.verified,
    isDeleted: input.isDeleted,
    isArchived: input.isArchived,
    isSupporter: input.isSupporter,
    createdAt: parseDateOrThrow(input.createdAt, "createdAt"),
    lastActivityAt: parseDateOrThrow(input.lastActivityAt, "lastActivityAt"),
    verifiedAt: parseOptionalDate(input.verifiedAt, "verifiedAt"),
    deletedAt: parseOptionalDate(input.deletedAt, "deletedAt"),
    archivedAt: parseOptionalDate(input.archivedAt, "archivedAt"),
    supporterFrom: parseOptionalDate(input.supporterFrom, "supporterFrom"),
  });

export const mapUserDomainToDTO = (user: User): UserDTO => user.toDB();

export const mapUserDomainToView = (user: User): UserProps => user.toJSON();

