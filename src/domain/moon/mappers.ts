import { Moon } from "./Moon.aggregate";
import { MoonApiResponse, MoonDTO, MoonProps } from "../../types/moon.types";

export const mapMoonApiToDomain = (input: MoonApiResponse): Moon =>
  Moon.rehydrate({
    id: input.id,
    planetId: input.planetId,
    name: input.name,
    size: input.size,
    orbital: input.orbital,
    relativeMass: input.relativeMass,
    relativeRadius: input.relativeRadius,
    temperature: input.temperature,
  });

export const mapMoonDomainToDTO = (moon: Moon): MoonDTO => moon.toDB();

export const mapMoonDomainToView = (moon: Moon): MoonProps => moon.toJSON();

