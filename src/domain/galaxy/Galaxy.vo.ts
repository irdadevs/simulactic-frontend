import { REGEXP } from "../../lib/Regexp.map";
import { ErrorFactory } from "../../lib/errors/Error.map";
import { GalaxyShapeValue } from "./types";

export const ALLOWED_GALAXY_SHAPES = [
  "spherical",
  "3-arm spiral",
  "5-arm spiral",
  "irregular",
] as const;

export class GalaxyName {
  private constructor(private readonly value: string) {}

  static create(value: string): GalaxyName {
    const normalized = value.trim();
    if (!REGEXP.galaxyName.test(normalized)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_GALAXY_NAME", {
        name: value,
      });
    }
    return new GalaxyName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: GalaxyName): boolean {
    return this.value === other.value;
  }
}

export class GalaxyShape {
  private constructor(private readonly value: GalaxyShapeValue) {}

  static create(value: string): GalaxyShape {
    const valid = ALLOWED_GALAXY_SHAPES.includes(value as GalaxyShapeValue);
    if (!valid) {
      throw ErrorFactory.domain("DOMAIN.INVALID_GALAXY_SHAPE", {
        shape: value,
      });
    }
    return new GalaxyShape(value as GalaxyShapeValue);
  }

  toString(): GalaxyShapeValue {
    return this.value;
  }

  equals(other: GalaxyShape): boolean {
    return this.value === other.value;
  }
}
