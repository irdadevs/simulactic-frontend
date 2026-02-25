import { REGEXP } from "../../lib/Regexp.map";
import { ErrorFactory } from "../../lib/errors/Error.map";
import { AsteroidSize, AsteroidType } from "../../types/asteroid.types";

export const ALLOWED_ASTEROID_TYPES: readonly AsteroidType[] = ["single", "cluster"];
export const ALLOWED_ASTEROID_SIZES: readonly AsteroidSize[] = [
  "small",
  "medium",
  "big",
  "massive",
];

export class AsteroidName {
  private constructor(private readonly value: string) {}

  static create(value: string): AsteroidName {
    const normalized = value.trim();
    if (!REGEXP.asteroidName.test(normalized)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_ASTEROID_NAME", {
        name: value,
      });
    }
    return new AsteroidName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: AsteroidName): boolean {
    return this.value === other.value;
  }
}

export class AsteroidTypeValue {
  private constructor(private readonly value: AsteroidType) {}

  static create(value: string): AsteroidTypeValue {
    if (!ALLOWED_ASTEROID_TYPES.includes(value as AsteroidType)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_ASTEROID_TYPE", {
        type: value,
      });
    }
    return new AsteroidTypeValue(value as AsteroidType);
  }

  toString(): AsteroidType {
    return this.value;
  }
}

export class AsteroidSizeValue {
  private constructor(private readonly value: AsteroidSize) {}

  static create(value: string): AsteroidSizeValue {
    if (!ALLOWED_ASTEROID_SIZES.includes(value as AsteroidSize)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_ASTEROID_SIZE", {
        size: value,
      });
    }
    return new AsteroidSizeValue(value as AsteroidSize);
  }

  toString(): AsteroidSize {
    return this.value;
  }
}

