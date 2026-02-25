export type MoonSize = "dwarf" | "medium" | "giant";

export type MoonProps = {
  id: string;
  planetId: string;
  name: string;
  size: MoonSize;
  orbital: number;
  relativeMass: number;
  absoluteMass: number;
  relativeRadius: number;
  absoluteRadius: number;
  gravity: number;
  temperature: number;
};

export type MoonCreateProps = {
  id?: string;
  planetId: string;
  name: string;
  size: MoonSize;
  orbital: number;
  relativeMass: number;
  absoluteMass: number;
  relativeRadius: number;
  absoluteRadius: number;
  gravity: number;
  temperature: number;
};

export type MoonDTO = {
  id: string;
  planet_id: string;
  name: string;
  size: MoonSize;
  orbital: number;
  relative_mass: number;
  absolute_mass: number;
  relative_radius: number;
  absolute_radius: number;
  gravity: number;
  temperature: number;
};

export type MoonApiResponse = {
  id: string;
  planet_id: string;
  name: string;
  size: MoonSize;
  orbital: number;
  relative_mass: number;
  absolute_mass: number;
  relative_radius: number;
  absolute_radius: number;
  gravity: number;
  temperature: number;
};
