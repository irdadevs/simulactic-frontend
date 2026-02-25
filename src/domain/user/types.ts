export type UserRole = "User" | "Admin";

export type UserProps = {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  isVerified: boolean;
  verificationCode: string | null;
  verificationCodeExpiresAt: Date | null;
  verifiedAt: Date | null;
  isDeleted: boolean;
  isArchived: boolean;
  isSupporter: boolean;
  supporterFrom: Date | null;
  role: UserRole;
  deletedAt: Date | null;
  archivedAt: Date | null;
  lastActivityAt: Date;
  createdAt: Date;
};

export type UserCreateProps = {
  id?: string;
  email: string;
  passwordHash: string;
  username: string;
  isVerified?: boolean;
  verificationCode?: string | null;
  verificationCodeExpiresAt?: Date | null;
  verifiedAt?: Date | null;
  isDeleted?: boolean;
  isArchived?: boolean;
  isSupporter?: boolean;
  supporterFrom?: Date | null;
  role?: UserRole;
  deletedAt?: Date | null;
  archivedAt?: Date | null;
  lastActivityAt?: Date;
  createdAt?: Date;
};

export type UserDTO = {
  id: string;
  email: string;
  username: string;
  password: string;
  is_verified: boolean;
  verification_code: string | null;
  verification_code_expires_at: Date | null;
  verified_at: Date | null;
  is_deleted: boolean;
  is_archived: boolean;
  is_supporter: boolean;
  supporter_from: Date | null;
  role: UserRole;
  deleted_at: Date | null;
  archived_at: Date | null;
  last_activity_at: Date;
  created_at: Date;
};

export type UserApiResponse = {
  id: string;
  email: string;
  username: string;
  password: string;
  is_verified: boolean;
  verification_code: string | null;
  verification_code_expires_at: string | Date | null;
  verified_at: string | Date | null;
  is_deleted: boolean;
  is_archived: boolean;
  is_supporter: boolean;
  supporter_from: string | Date | null;
  role: UserRole;
  deleted_at: string | Date | null;
  archived_at: string | Date | null;
  last_activity_at: string | Date;
  created_at: string | Date;
};
