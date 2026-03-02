import { Star } from "./Star.aggregate";
import { StarApiResponse, StarDTO, StarProps } from "../../types/star.types";

export const mapStarApiToDomain = (input: StarApiResponse): Star =>
  Star.rehydrate({
    id: input.id,
    systemId: input.systemId,
    name: input.name,
    starType: input.starType,
    starClass: input.starClass,
    surfaceTemperature: input.surfaceTemperature,
    color: input.color,
    relativeMass: input.relativeMass,
    relativeRadius: input.relativeRadius,
    isMain: input.isMain,
    orbital: input.orbital,
    orbitalStarter: input.orbitalStarter,
  });

export const mapStarDomainToDTO = (star: Star): StarDTO => star.toDB();

export const mapStarDomainToView = (star: Star): StarProps => star.toJSON();

