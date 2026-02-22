import { REGEXP } from "../../lib/Regexp.map";
import { ErrorFactory } from "../../lib/errors/Error.map";

const randomUuid = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = Math.floor(Math.random() * 16);
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class Uuid {
  private constructor(private readonly value: string) {}

  static create(value?: string): Uuid {
    const id = value ?? randomUuid();
    if (!REGEXP.uuid.test(id)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_USER_ID", { id });
    }
    return new Uuid(id);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Uuid): boolean {
    return this.value === other.value;
  }
}
