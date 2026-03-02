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
};

export type SerializedGalaxyViewData = {
  systems: SerializedGalaxyNode[];
};

export type SerializedPlanet = {
  planetId: string;
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
    color?: string;
  }>;
};

export type SerializedSystemViewData = SerializedSystemData;
