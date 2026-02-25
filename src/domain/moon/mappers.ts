import { Moon } from "./Moon.aggregate";
import { MoonApiResponse, MoonDTO, MoonProps } from "./types";

export const mapMoonApiToDomain = (input: MoonApiResponse): Moon =>
  Moon.rehydrate({
    id: input.id,
    planetId: input.planet_id,
    name: input.name,
    size: input.size,
    orbital: input.orbital,
    relativeMass: input.relative_mass,
    absoluteMass: input.absolute_mass,
    relativeRadius: input.relative_radius,
    absoluteRadius: input.absolute_radius,
    gravity: input.gravity,
    temperature: input.temperature,
  });

export const mapMoonDomainToDTO = (moon: Moon): MoonDTO => moon.toDB();

export const mapMoonDomainToView = (moon: Moon): MoonProps => moon.toJSON();
