import { ErrorFactory } from "../../lib/errors/Error.map";
import { Uuid } from "../shared/Uuid.vo";
import { Email, PasswordHash, Role, Username } from "./User.vo";
import { UserCreateProps, UserDTO, UserProps, UserRole } from "./types";

type UserState = {
  id: Uuid;
  email: Email;
  passwordHash: PasswordHash;
  username: Username;
  isVerified: boolean;
  verificationCode: string | null;
  verificationCodeExpiresAt: Date | null;
  verifiedAt: Date | null;
  isDeleted: boolean;
  isArchived: boolean;
  isSupporter: boolean;
  supporterFrom: Date | null;
  role: Role;
  deletedAt: Date | null;
  archivedAt: Date | null;
  lastActivityAt: Date;
  createdAt: Date;
};

export class User {
  private props: UserState;

  private constructor(props: UserState) {
    this.props = { ...props };
  }

  static create(input: UserCreateProps): User {
    const now = new Date();

    return new User({
      id: Uuid.create(input.id),
      email: Email.create(input.email),
      passwordHash: PasswordHash.create(input.passwordHash),
      username: Username.create(input.username),
      isVerified: input.isVerified ?? false,
      verificationCode: input.verificationCode ?? null,
      verificationCodeExpiresAt: input.verificationCodeExpiresAt ?? null,
      verifiedAt: input.verifiedAt ?? null,
      isDeleted: input.isDeleted ?? false,
      isArchived: input.isArchived ?? false,
      isSupporter: input.isSupporter ?? false,
      supporterFrom: input.supporterFrom ?? null,
      role: Role.create(input.role ?? "User"),
      deletedAt: input.deletedAt ?? null,
      archivedAt: input.archivedAt ?? null,
      lastActivityAt: input.lastActivityAt ?? now,
      createdAt: input.createdAt ?? now,
    });
  }

  static rehydrate(props: UserProps): User {
    return new User({
      id: Uuid.create(props.id),
      email: Email.create(props.email),
      passwordHash: PasswordHash.create(props.passwordHash),
      username: Username.create(props.username),
      isVerified: props.isVerified,
      verificationCode: props.verificationCode,
      verificationCodeExpiresAt: props.verificationCodeExpiresAt,
      verifiedAt: props.verifiedAt,
      isDeleted: props.isDeleted,
      isArchived: props.isArchived,
      isSupporter: props.isSupporter,
      supporterFrom: props.supporterFrom,
      role: Role.create(props.role),
      deletedAt: props.deletedAt,
      archivedAt: props.archivedAt,
      lastActivityAt: props.lastActivityAt,
      createdAt: props.createdAt,
    });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get email(): string {
    return this.props.email.toString();
  }

  get passwordHash(): string {
    return this.props.passwordHash.toString();
  }

  get username(): string {
    return this.props.username.toString();
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get verificationCode(): string | null {
    return this.props.verificationCode;
  }

  get verificationCodeExpiresAt(): Date | null {
    return this.props.verificationCodeExpiresAt;
  }

  get verifiedAt(): Date | null {
    return this.props.verifiedAt;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  get isArchived(): boolean {
    return this.props.isArchived;
  }

  get isSupporter(): boolean {
    return this.props.isSupporter;
  }

  get supporterFrom(): Date | null {
    return this.props.supporterFrom;
  }

  get role(): UserRole {
    return this.props.role.toString();
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  get archivedAt(): Date | null {
    return this.props.archivedAt;
  }

  get lastActivityAt(): Date {
    return this.props.lastActivityAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  verifyEmail(): void {
    if (!this.props.isVerified) {
      this.props.isVerified = true;
      this.props.verifiedAt = new Date();
      this.props.verificationCode = null;
      this.props.verificationCodeExpiresAt = null;
    }
  }

  setVerificationCode(code: string, expiresAt: Date): void {
    this.props.verificationCode = code.trim();
    this.props.verificationCodeExpiresAt = expiresAt;
    this.props.verifiedAt = null;
    this.props.isVerified = false;
  }

  changeEmail(value: string): void {
    const next = Email.create(value);
    if (!next.equals(this.props.email)) {
      this.props.email = next;
    }
  }

  changePasswordHash(value: string): void {
    const next = PasswordHash.create(value);
    if (!next.equals(this.props.passwordHash)) {
      this.props.passwordHash = next;
    }
  }

  changeUsername(value: string): void {
    const next = Username.create(value);
    if (!next.equals(this.props.username)) {
      this.props.username = next;
    }
  }

  changeRole(value: UserRole): void {
    const next = Role.create(value);
    if (!next.equals(this.props.role)) {
      this.props.role = next;
    }
  }

  softDelete(at?: Date): void {
    if (!this.props.isDeleted) {
      this.props.isDeleted = true;
      this.props.deletedAt = at ?? new Date();
    }
  }

  archive(at?: Date): void {
    if (!this.props.isArchived) {
      const when = at ?? new Date();
      this.props.isArchived = true;
      this.props.archivedAt = when;
      this.props.isDeleted = true;
      this.props.deletedAt = this.props.deletedAt ?? when;
    }
  }

  restore(): void {
    if (this.props.isArchived) {
      throw ErrorFactory.domain("USERS.RESTORE_FAILED", {
        cause: "Archived users can not be restored",
        userId: this.id,
      });
    }

    if (this.props.isDeleted) {
      this.props.isDeleted = false;
      this.props.deletedAt = null;
    }
  }

  unarchive(at?: Date): void {
    if (this.props.isArchived) {
      this.props.isArchived = false;
      this.props.archivedAt = null;
      this.props.isDeleted = false;
      this.props.deletedAt = null;
      this.props.lastActivityAt = at ?? new Date();
    }
  }

  markSupporter(from?: Date): void {
    this.props.isSupporter = true;
    if (!this.props.supporterFrom) {
      this.props.supporterFrom = from ?? new Date();
    }
  }

  touchActivity(at?: Date): void {
    this.props.lastActivityAt = at ?? new Date();
  }

  toJSON(): UserProps {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      username: this.username,
      isVerified: this.isVerified,
      verificationCode: this.verificationCode,
      verificationCodeExpiresAt: this.verificationCodeExpiresAt,
      verifiedAt: this.verifiedAt,
      isDeleted: this.isDeleted,
      isArchived: this.isArchived,
      isSupporter: this.isSupporter,
      supporterFrom: this.supporterFrom,
      role: this.role,
      deletedAt: this.deletedAt,
      archivedAt: this.archivedAt,
      lastActivityAt: this.lastActivityAt,
      createdAt: this.createdAt,
    };
  }

  toDB(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      password: this.passwordHash,
      is_verified: this.isVerified,
      verification_code: this.verificationCode,
      verification_code_expires_at: this.verificationCodeExpiresAt,
      verified_at: this.verifiedAt,
      is_deleted: this.isDeleted,
      is_archived: this.isArchived,
      is_supporter: this.isSupporter,
      supporter_from: this.supporterFrom,
      role: this.role,
      deleted_at: this.deletedAt,
      archived_at: this.archivedAt,
      last_activity_at: this.lastActivityAt,
      created_at: this.createdAt,
    };
  }
}
