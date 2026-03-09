import { StarType } from "../../types/star.types";

export const STAR_TYPE_COLOR_PALETTE: Record<StarType, string> = {
  "Blue supergiant": "#3b7dff",
  "Blue giant": "#5bb8ff",
  "White dwarf": "#f5f7ff",
  "Brown dwarf": "#9b5d2d",
  "Yellow dwarf": "#ffd24a",
  Subdwarf: "#ff9b33",
  "Red dwarf": "#e25743",
  "Black hole": "#0a0a0a",
  "Neutron star": "#d9ebff",
};

export const colorByStarType = (starType: StarType, fallback?: string): string =>
  STAR_TYPE_COLOR_PALETTE[starType] ?? fallback ?? "#f8ffe5";
