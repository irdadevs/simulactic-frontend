export type PlanetType = "solid" | "gas";

export type PlanetSize = "proto" | "dwarf" | "medium" | "giant" | "supergiant";

export type PlanetBiome =
  | "none"
  | "gaia"
  | "temperate"
  | "continental"
  | "desert"
  | "ocean"
  | "archipelago"
  | "forest"
  | "jungle"
  | "savanna"
  | "wetlands"
  | "meadow"
  | "arid"
  | "dune"
  | "volcanic"
  | "lava"
  | "ice"
  | "tundra"
  | "glacial"
  | "snow"
  | "permafrost"
  | "frozen_ocean"
  | "ice_canyon"
  | "cryo_volcanic"
  | "polar_desert"
  | "frost_crystal"
  | "toxic"
  | "radioactive"
  | "sulfuric"
  | "crystal"
  | "barren";

export type PlanetProps = {
  id: string;
  systemId: string;
  name: string;
  type: PlanetType;
  size: PlanetSize;
  orbital: number;
  biome: PlanetBiome;
  relativeMass: number;
  relativeRadius: number;
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
  relativeRadius: number;
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
  relative_radius: number;
  temperature: number;
};

export type PlanetApiResponse = {
  id: string;
  systemId: string;
  name: string;
  type: PlanetType;
  size: PlanetSize;
  orbital: number;
  biome: PlanetBiome;
  relativeMass: number;
  relativeRadius: number;
  temperature: number;
};
