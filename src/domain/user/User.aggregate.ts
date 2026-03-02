import { Uuid } from "../shared/Uuid.vo";
import { Email, Role } from "./User.vo";
import { UserCreateProps, UserDTO, UserProps, UserRole } from "../../types/user.types";

type UserState = {
  id: Uuid;
  email: Email;
  username: string;
  role: Role;
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

export class User {
  private props: UserState;

  private constructor(props: UserState) {
    this.props = { ...props };
  }

  static create(input: UserCreateProps): User {
    return new User({
      id: Uuid.create(input.id),
      email: Email.create(input.email),
      username: input.username.trim(),
      role: Role.create(input.role ?? "User"),
      verified: input.verified ?? false,
      isDeleted: input.isDeleted ?? false,
      isArchived: input.isArchived ?? false,
      isSupporter: input.isSupporter ?? false,
      createdAt: input.createdAt ?? new Date(),
      lastActivityAt: input.lastActivityAt ?? new Date(),
      verifiedAt: input.verifiedAt ?? null,
      deletedAt: input.deletedAt ?? null,
      archivedAt: input.archivedAt ?? null,
      supporterFrom: input.supporterFrom ?? null,
    });
  }

  static rehydrate(props: UserProps): User {
    return new User({
      id: Uuid.create(props.id),
      email: Email.create(props.email),
      username: props.username,
      role: Role.create(props.role),
      verified: props.verified,
      isDeleted: props.isDeleted,
      isArchived: props.isArchived,
      isSupporter: props.isSupporter,
      createdAt: props.createdAt,
      lastActivityAt: props.lastActivityAt,
      verifiedAt: props.verifiedAt,
      deletedAt: props.deletedAt,
      archivedAt: props.archivedAt,
      supporterFrom: props.supporterFrom,
    });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get email(): string {
    return this.props.email.toString();
  }

  get username(): string {
    return this.props.username;
  }

  get role(): UserRole {
    return this.props.role.toString();
  }

  get verified(): boolean {
    return this.props.verified;
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get lastActivityAt(): Date {
    return this.props.lastActivityAt;
  }

  get verifiedAt(): Date | null {
    return this.props.verifiedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  get archivedAt(): Date | null {
    return this.props.archivedAt;
  }

  get supporterFrom(): Date | null {
    return this.props.supporterFrom;
  }

  changeEmail(value: string): void {
    const next = Email.create(value);
    if (!next.equals(this.props.email)) {
      this.props.email = next;
    }
  }

  changeRole(value: UserRole): void {
    const next = Role.create(value);
    if (!next.equals(this.props.role)) {
      this.props.role = next;
    }
  }

  markVerified(): void {
    this.props.verified = true;
    this.props.verifiedAt = this.props.verifiedAt ?? new Date();
  }

  toJSON(): UserProps {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      role: this.role,
      verified: this.verified,
      isDeleted: this.isDeleted,
      isArchived: this.isArchived,
      isSupporter: this.isSupporter,
      createdAt: this.createdAt,
      lastActivityAt: this.lastActivityAt,
      verifiedAt: this.verifiedAt,
      deletedAt: this.deletedAt,
      archivedAt: this.archivedAt,
      supporterFrom: this.supporterFrom,
    };
  }

  toDB(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      role: this.role,
      verified: this.verified,
      is_deleted: this.isDeleted,
      is_archived: this.isArchived,
      is_supporter: this.isSupporter,
      created_at: this.createdAt,
      last_activity_at: this.lastActivityAt,
      verified_at: this.verifiedAt,
      deleted_at: this.deletedAt,
      archived_at: this.archivedAt,
      supporter_from: this.supporterFrom,
    };
  }
}

