export type MoonSize = "dwarf" | "medium" | "giant";

export type MoonProps = {
  id: string;
  planetId: string;
  name: string;
  size: MoonSize;
  orbital: number;
  relativeMass: number;
  relativeRadius: number;
  temperature: number;
};

export type MoonCreateProps = {
  id?: string;
  planetId: string;
  name: string;
  size: MoonSize;
  orbital: number;
  relativeMass: number;
  relativeRadius: number;
  temperature: number;
};

export type MoonDTO = {
  id: string;
  planet_id: string;
  name: string;
  size: MoonSize;
  orbital: number;
  relative_mass: number;
  relative_radius: number;
  temperature: number;
};

export type MoonApiResponse = {
  id: string;
  planetId: string;
  name: string;
  size: MoonSize;
  orbital: number;
  relativeMass: number;
  relativeRadius: number;
  temperature: number;
};
