import { REGEXP } from "../../lib/Regexp.map";
import { ErrorFactory } from "../../lib/errors/Error.map";
import { MoonSize } from "./types";

export const ALLOWED_MOON_SIZES: readonly MoonSize[] = ["dwarf", "medium", "giant"];

export class MoonName {
  private constructor(private readonly value: string) {}

  static create(value: string): MoonName {
    const normalized = value.trim();
    if (!REGEXP.moonName.test(normalized)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_MOON_NAME", {
        name: value,
      });
    }
    return new MoonName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: MoonName): boolean {
    return this.value === other.value;
  }
}

export class MoonSizeValue {
  private constructor(private readonly value: MoonSize) {}

  static create(value: string): MoonSizeValue {
    if (!ALLOWED_MOON_SIZES.includes(value as MoonSize)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_MOON_SIZE", {
        size: value,
      });
    }
    return new MoonSizeValue(value as MoonSize);
  }

  toString(): MoonSize {
    return this.value;
  }
}
