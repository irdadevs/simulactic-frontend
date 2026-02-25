export type StarType =
  | "Blue supergiant"
  | "Blue giant"
  | "White dwarf"
  | "Brown dwarf"
  | "Yellow dwarf"
  | "Subdwarf"
  | "Red dwarf"
  | "Black hole"
  | "Neutron star";

export type StarClass = "O" | "B" | "A" | "F" | "G" | "K" | "M" | "BH" | "N";

export type StarColor =
  | "blue"
  | "blue-white"
  | "white"
  | "yellow-white"
  | "yellow"
  | "orange"
  | "red"
  | "black";

export type StarProps = {
  id: string;
  systemId: string;
  name: string;
  starType: StarType;
  starClass: StarClass;
  surfaceTemperature: number;
  color: StarColor;
  relativeMass: number;
  absoluteMass: number;
  relativeRadius: number;
  absoluteRadius: number;
  gravity: number;
  isMain: boolean;
  orbital: number;
  orbitalStarter: number;
};

export type StarCreateProps = {
  id?: string;
  systemId: string;
  name: string;
  starType: StarType;
  starClass: StarClass;
  surfaceTemperature: number;
  color: StarColor;
  relativeMass: number;
  absoluteMass: number;
  relativeRadius: number;
  absoluteRadius: number;
  gravity: number;
  isMain?: boolean;
  orbital: number;
  orbitalStarter: number;
};

export type StarDTO = {
  id: string;
  system_id: string;
  name: string;
  star_type: StarType;
  star_class: StarClass;
  surface_temperature: number;
  color: StarColor;
  relative_mass: number;
  absolute_mass: number;
  relative_radius: number;
  absolute_radius: number;
  gravity: number;
  is_main: boolean;
  orbital: number;
  orbital_starter: number;
};

export type StarApiResponse = {
  id: string;
  system_id: string;
  name: string;
  star_type: StarType;
  star_class: StarClass;
  surface_temperature: number;
  color: StarColor;
  relative_mass: number;
  absolute_mass: number;
  relative_radius: number;
  absolute_radius: number;
  gravity: number;
  is_main: boolean;
  orbital: number;
  orbital_starter: number;
};
