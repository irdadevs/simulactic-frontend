export type PlanetType = "solid" | "gas";

export type PlanetSize = "proto" | "dwarf" | "medium" | "giant" | "supergiant";

export type PlanetBiome =
  | "temperate"
  | "desert"
  | "ocean"
  | "ice"
  | "toxic"
  | "radioactive"
  | "crystal";

export type PlanetProps = {
  id: string;
  systemId: string;
  name: string;
  type: PlanetType;
  size: PlanetSize;
  orbital: number;
  biome: PlanetBiome;
  relativeMass: number;
  absoluteMass: number;
  relativeRadius: number;
  absoluteRadius: number;
  gravity: number;
  temperature: number;
};

export type PlanetCreateProps = {
  id?: string;
  systemId: string;
  name: string;
  type: PlanetType;
  size: PlanetSize;
  orbital: number;
  biome: PlanetBiome;
  relativeMass: number;
  absoluteMass: number;
  relativeRadius: number;
  absoluteRadius: number;
  gravity: number;
  temperature: number;
};

export type PlanetDTO = {
  id: string;
  system_id: string;
  name: string;
  type: PlanetType;
  size: PlanetSize;
  orbital: number;
  biome: PlanetBiome;
  relative_mass: number;
  absolute_mass: number;
  relative_radius: number;
  absolute_radius: number;
  gravity: number;
  temperature: number;
};

export type PlanetApiResponse = {
  id: string;
  system_id: string;
  name: string;
  type: PlanetType;
  size: PlanetSize;
  orbital: number;
  biome: PlanetBiome;
  relative_mass: number;
  absolute_mass: number;
  relative_radius: number;
  absolute_radius: number;
  gravity: number;
  temperature: number;
};
