export type UserRole = "User" | "Admin";

export type UserProps = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  verified: boolean;
  isDeleted: boolean;
  isArchived: boolean;
  isSupporter: boolean;
  createdAt: Date;
  lastActivityAt: Date;
  verifiedAt: Date | null;
  deletedAt: Date | null;
  archivedAt: Date | null;
  supporterFrom: Date | null;
};

export type UserCreateProps = {
  id?: string;
  email: string;
  username: string;
  role?: UserRole;
  verified?: boolean;
  isDeleted?: boolean;
  isArchived?: boolean;
  isSupporter?: boolean;
  createdAt?: Date;
  lastActivityAt?: Date;
  verifiedAt?: Date | null;
  deletedAt?: Date | null;
  archivedAt?: Date | null;
  supporterFrom?: Date | null;
};

export type UserDTO = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  verified: boolean;
  is_deleted: boolean;
  is_archived: boolean;
  is_supporter: boolean;
  created_at: Date;
  last_activity_at: Date;
  verified_at: Date | null;
  deleted_at: Date | null;
  archived_at: Date | null;
  supporter_from: Date | null;
};

export type UserApiResponse = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  verified: boolean;
  isDeleted: boolean;
  isArchived: boolean;
  isSupporter: boolean;
  createdAt: string | Date;
  lastActivityAt: string | Date;
  verifiedAt: string | Date | null;
  deletedAt: string | Date | null;
  archivedAt: string | Date | null;
  supporterFrom: string | Date | null;
};
