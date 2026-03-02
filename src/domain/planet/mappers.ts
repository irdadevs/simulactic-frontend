import { Planet } from "./Planet.aggregate";
import { PlanetApiResponse, PlanetDTO, PlanetProps } from "../../types/planet.types";

export const mapPlanetApiToDomain = (input: PlanetApiResponse): Planet =>
  Planet.rehydrate({
    id: input.id,
    systemId: input.systemId,
    name: input.name,
    type: input.type,
    size: input.size,
    orbital: input.orbital,
    biome: input.biome,
    relativeMass: input.relativeMass,
    relativeRadius: input.relativeRadius,
    temperature: input.temperature,
  });

export const mapPlanetDomainToDTO = (planet: Planet): PlanetDTO => planet.toDB();

export const mapPlanetDomainToView = (planet: Planet): PlanetProps => planet.toJSON();

