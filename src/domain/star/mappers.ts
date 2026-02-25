import { Star } from "./Star.aggregate";
import { StarApiResponse, StarDTO, StarProps } from "../../types/star.types";

export const mapStarApiToDomain = (input: StarApiResponse): Star =>
  Star.rehydrate({
    id: input.id,
    systemId: input.system_id,
    name: input.name,
    starType: input.star_type,
    starClass: input.star_class,
    surfaceTemperature: input.surface_temperature,
    color: input.color,
    relativeMass: input.relative_mass,
    absoluteMass: input.absolute_mass,
    relativeRadius: input.relative_radius,
    absoluteRadius: input.absolute_radius,
    gravity: input.gravity,
    isMain: input.is_main,
    orbital: input.orbital,
    orbitalStarter: input.orbital_starter,
  });

export const mapStarDomainToDTO = (star: Star): StarDTO => star.toDB();

export const mapStarDomainToView = (star: Star): StarProps => star.toJSON();

