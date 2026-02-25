import { Uuid } from "../shared/Uuid.vo";
import { Email, Role } from "./User.vo";
import { UserCreateProps, UserDTO, UserProps, UserRole } from "../../types/user.types";

type UserState = {
  id: Uuid;
  email: Email;
  role: Role;
  verified: boolean;
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
      role: Role.create(input.role ?? "User"),
      verified: input.verified ?? false,
    });
  }

  static rehydrate(props: UserProps): User {
    return new User({
      id: Uuid.create(props.id),
      email: Email.create(props.email),
      role: Role.create(props.role),
      verified: props.verified,
    });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get email(): string {
    return this.props.email.toString();
  }

  get role(): UserRole {
    return this.props.role.toString();
  }

  get verified(): boolean {
    return this.props.verified;
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
  }

  toJSON(): UserProps {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      verified: this.verified,
    };
  }

  toDB(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      verified: this.verified,
    };
  }
}

