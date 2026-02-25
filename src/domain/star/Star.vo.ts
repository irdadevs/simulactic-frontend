import { REGEXP } from "../../lib/Regexp.map";
import { ErrorFactory } from "../../lib/errors/Error.map";
import { StarClass, StarColor, StarType } from "./types";

export const ALLOWED_STAR_TYPES: readonly StarType[] = [
  "Blue supergiant",
  "Blue giant",
  "White dwarf",
  "Brown dwarf",
  "Yellow dwarf",
  "Subdwarf",
  "Red dwarf",
  "Black hole",
  "Neutron star",
] as const;

export const ALLOWED_STAR_CLASSES: readonly StarClass[] = [
  "O",
  "B",
  "A",
  "F",
  "G",
  "K",
  "M",
  "BH",
  "N",
] as const;

export const STAR_CLASS_COLOR: Readonly<Record<StarClass, StarColor>> = {
  O: "blue",
  B: "blue-white",
  A: "white",
  F: "yellow-white",
  G: "yellow",
  K: "orange",
  M: "red",
  BH: "black",
  N: "blue-white",
};

export class StarName {
  private constructor(private readonly value: string) {}

  static create(value: string): StarName {
    const normalized = value.trim();
    if (!REGEXP.planetName.test(normalized)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_STAR_VALUE", {
        field: "name",
      });
    }
    return new StarName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: StarName): boolean {
    return this.value === other.value;
  }
}

export class StarTypeValue {
  private constructor(private readonly value: StarType) {}

  static create(value: string): StarTypeValue {
    if (!ALLOWED_STAR_TYPES.includes(value as StarType)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_STAR_TYPE", {
        type: value,
      });
    }
    return new StarTypeValue(value as StarType);
  }

  toString(): StarType {
    return this.value;
  }

  equals(other: StarTypeValue): boolean {
    return this.value === other.value;
  }
}

export class StarClassValue {
  private constructor(private readonly value: StarClass) {}

  static create(value: string): StarClassValue {
    if (!ALLOWED_STAR_CLASSES.includes(value as StarClass)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_STAR_CLASS", {
        class: value,
      });
    }
    return new StarClassValue(value as StarClass);
  }

  toString(): StarClass {
    return this.value;
  }

  equals(other: StarClassValue): boolean {
    return this.value === other.value;
  }
}

export class StarColorValue {
  private constructor(private readonly value: StarColor) {}

  static create(value: string): StarColorValue {
    if (!(Object.values(STAR_CLASS_COLOR) as string[]).includes(value)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_STAR_COLOR", {
        color: value,
      });
    }
    return new StarColorValue(value as StarColor);
  }

  toString(): StarColor {
    return this.value;
  }

  equals(other: StarColorValue): boolean {
    return this.value === other.value;
  }
}
