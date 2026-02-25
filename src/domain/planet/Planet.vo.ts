import { REGEXP } from "../../lib/Regexp.map";
import { ErrorFactory } from "../../lib/errors/Error.map";
import { PlanetBiome, PlanetSize, PlanetType } from "../../types/planet.types";

export const ALLOWED_PLANET_TYPES: readonly PlanetType[] = ["solid", "gas"] as const;

export const ALLOWED_PLANET_SIZES: readonly PlanetSize[] = [
  "proto",
  "dwarf",
  "medium",
  "giant",
  "supergiant",
] as const;

export const ALLOWED_PLANET_BIOMES: readonly PlanetBiome[] = [
  "temperate",
  "desert",
  "ocean",
  "ice",
  "toxic",
  "radioactive",
  "crystal",
] as const;

export class PlanetName {
  private constructor(private readonly value: string) {}

  static create(value: string): PlanetName {
    const normalized = value.trim();
    if (!REGEXP.planetName.test(normalized)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_PLANET_NAME", {
        name: value,
      });
    }
    return new PlanetName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: PlanetName): boolean {
    return this.value === other.value;
  }
}

export class PlanetTypeValue {
  private constructor(private readonly value: PlanetType) {}

  static create(value: string): PlanetTypeValue {
    if (!ALLOWED_PLANET_TYPES.includes(value as PlanetType)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_PLANET_TYPE", {
        type: value,
      });
    }
    return new PlanetTypeValue(value as PlanetType);
  }

  toString(): PlanetType {
    return this.value;
  }
}

export class PlanetSizeValue {
  private constructor(private readonly value: PlanetSize) {}

  static create(value: string): PlanetSizeValue {
    if (!ALLOWED_PLANET_SIZES.includes(value as PlanetSize)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_PLANET_SIZE", {
        size: value,
      });
    }
    return new PlanetSizeValue(value as PlanetSize);
  }

  toString(): PlanetSize {
    return this.value;
  }
}

export class PlanetBiomeValue {
  private constructor(private readonly value: PlanetBiome) {}

  static create(value: string): PlanetBiomeValue {
    if (!ALLOWED_PLANET_BIOMES.includes(value as PlanetBiome)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_PLANET_BIOME", {
        biome: value,
      });
    }
    return new PlanetBiomeValue(value as PlanetBiome);
  }

  toString(): PlanetBiome {
    return this.value;
  }
}

