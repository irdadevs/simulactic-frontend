import { AsteroidType } from "../../types/asteroid.types";
import { PlanetBiome, PlanetType } from "../../types/planet.types";
import { StarType } from "../../types/star.types";

export type SerializedVector3 = {
  x: number;
  y: number;
  z: number;
};

export type SerializedGalaxyNode = {
  systemId: string;
  position: SerializedVector3;
  color?: string;
  size?: number;
  representativeStarType?: StarType;
  hasBlackHole?: boolean;
  hasNeutronStar?: boolean;
};

export type SerializedGalaxyViewData = {
  systems: SerializedGalaxyNode[];
  focusSystemId?: string | null;
};

export type SerializedPlanet = {
  planetId: string;
  planetType: PlanetType;
  biome: PlanetBiome;
  orbital: number;
  size: number;
  color?: string;
  moons?: Array<{
    moonId: string;
    orbital: number;
    size: number;
    color?: string;
  }>;
};

export type SerializedSystemData = {
  systemId: string;
  stars: Array<{
    starId: string;
    starType: StarType;
    isMain: boolean;
    orbital: number;
    size: number;
    color?: string;
  }>;
  planets: SerializedPlanet[];
  asteroids?: Array<{
    asteroidId: string;
    orbital: number;
    size: number;
    type: AsteroidType;
    color?: string;
  }>;
};

export type SerializedSystemViewData = SerializedSystemData;
