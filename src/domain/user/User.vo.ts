import { REGEXP } from "../../lib/Regexp.map";
import { ErrorFactory } from "../../lib/errors/Error.map";
import { UserRole } from "./types";

export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();
    if (!REGEXP.email.test(normalized)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_USER_EMAIL", {
        email: value,
      });
    }
    return new Email(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

export class PasswordHash {
  private constructor(private readonly value: string) {}

  static create(value: string): PasswordHash {
    const normalized = value.trim();
    if (normalized.length < 10) {
      throw ErrorFactory.domain("DOMAIN.INVALID_USER_PASSWORD", {
        password: value,
      });
    }
    return new PasswordHash(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: PasswordHash): boolean {
    return this.value === other.value;
  }
}

export class Username {
  private constructor(private readonly value: string) {}

  static create(value: string): Username {
    const normalized = value.trim();
    if (!REGEXP.username.test(normalized)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_USER_USERNAME", {
        username: value,
      });
    }
    return new Username(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }
}

export class Role {
  private constructor(private readonly value: UserRole) {}

  static create(value: UserRole): Role {
    if (value !== "User" && value !== "Admin") {
      throw ErrorFactory.domain("DOMAIN.INVALID_USER_ROLE", {
        role: value,
      });
    }
    return new Role(value);
  }

  toString(): UserRole {
    return this.value;
  }

  equals(other: Role): boolean {
    return this.value === other.value;
  }
}
