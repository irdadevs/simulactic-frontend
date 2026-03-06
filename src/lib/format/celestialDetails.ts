import { AsteroidProps } from "../../types/asteroid.types";
import { MoonProps } from "../../types/moon.types";
import { PlanetProps } from "../../types/planet.types";
import { StarProps } from "../../types/star.types";

type DetailItem = {
  label: string;
  value: string;
};

const formatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
});

const SUN = {
  massKg: 1.98847e30,
  radiusKm: 695700,
  gravityMs2: 274,
};

const EARTH = {
  massKg: 5.9722e24,
  radiusKm: 6371,
  gravityMs2: 9.807,
};

const MOON = {
  massKg: 7.342e22,
  radiusKm: 1737.4,
  gravityMs2: 1.62,
};

const formatNumber = (value: number): string => formatter.format(value);

const formatSci = (value: number): string => value.toExponential(3);

const formatLabel = (key: string): string =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());

const createGravity = (relativeMass: number, relativeRadius: number): number => {
  if (!Number.isFinite(relativeMass) || !Number.isFinite(relativeRadius) || relativeRadius === 0) {
    return 0;
  }
  return relativeMass / (relativeRadius * relativeRadius);
};

export const starDetailItems = (star: StarProps): DetailItem[] => {
  const relativeGravity = createGravity(star.relativeMass, star.relativeRadius);
  return [
    { label: "Name", value: star.name },
    { label: "Star Type", value: star.starType },
    { label: "Star Class", value: star.starClass },
    { label: "Color", value: star.color },
    { label: "Surface Temperature (K)", value: formatNumber(star.surfaceTemperature) },
    { label: "Relative Mass (M☉)", value: formatNumber(star.relativeMass) },
    { label: "Mass (kg)", value: formatSci(star.relativeMass * SUN.massKg) },
    { label: "Relative Radius (R☉)", value: formatNumber(star.relativeRadius) },
    { label: "Radius (km)", value: formatNumber(star.relativeRadius * SUN.radiusKm) },
    { label: "Relative Gravity (g☉)", value: formatNumber(relativeGravity) },
    { label: "Gravity (m/s²)", value: formatNumber(relativeGravity * SUN.gravityMs2) },
    { label: "Orbital", value: formatNumber(star.orbital) },
  ];
};

export const planetDetailItems = (planet: PlanetProps, moonCount?: number): DetailItem[] => {
  const relativeGravity = createGravity(planet.relativeMass, planet.relativeRadius);
  const rows: DetailItem[] = [
    { label: "Name", value: planet.name },
    { label: "Type", value: planet.type },
    { label: "Size", value: planet.size },
    { label: "Biome", value: planet.biome },
    { label: "Temperature (K)", value: formatNumber(planet.temperature) },
    { label: "Relative Mass (M⊕)", value: formatNumber(planet.relativeMass) },
    { label: "Mass (kg)", value: formatSci(planet.relativeMass * EARTH.massKg) },
    { label: "Relative Radius (R⊕)", value: formatNumber(planet.relativeRadius) },
    { label: "Radius (km)", value: formatNumber(planet.relativeRadius * EARTH.radiusKm) },
    { label: "Relative Gravity (g⊕)", value: formatNumber(relativeGravity) },
    { label: "Gravity (m/s²)", value: formatNumber(relativeGravity * EARTH.gravityMs2) },
    { label: "Orbital", value: formatNumber(planet.orbital) },
  ];
  if (typeof moonCount === "number") {
    rows.push({ label: "Moon Count", value: formatNumber(moonCount) });
  }
  return rows;
};

export const moonDetailItems = (moon: MoonProps): DetailItem[] => {
  const relativeGravity = createGravity(moon.relativeMass, moon.relativeRadius);
  return [
    { label: "Name", value: moon.name },
    { label: "Size", value: moon.size },
    { label: "Temperature (K)", value: formatNumber(moon.temperature) },
    { label: "Relative Mass (M☾)", value: formatNumber(moon.relativeMass) },
    { label: "Mass (kg)", value: formatSci(moon.relativeMass * MOON.massKg) },
    { label: "Relative Radius (R☾)", value: formatNumber(moon.relativeRadius) },
    { label: "Radius (km)", value: formatNumber(moon.relativeRadius * MOON.radiusKm) },
    { label: "Relative Gravity (g☾)", value: formatNumber(relativeGravity) },
    { label: "Gravity (m/s²)", value: formatNumber(relativeGravity * MOON.gravityMs2) },
    { label: "Orbital", value: formatNumber(moon.orbital) },
  ];
};

export const asteroidDetailItems = (asteroid: AsteroidProps): DetailItem[] => [
  { label: "Name", value: asteroid.name },
  { label: "Type", value: asteroid.type },
  { label: "Size", value: asteroid.size },
  { label: "Orbital", value: formatNumber(asteroid.orbital) },
];

export const genericDetailItems = (input: Record<string, unknown>): DetailItem[] =>
  Object.entries(input)
    .filter(([key]) => !["id", "systemId", "planetId", "galaxyId", "orbitalStarter"].includes(key))
    .map(([key, value]) => ({
      label: formatLabel(key),
      value: typeof value === "number" ? formatNumber(value) : String(value),
    }));

