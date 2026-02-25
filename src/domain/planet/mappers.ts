import { Planet } from "./Planet.aggregate";
import { PlanetApiResponse, PlanetDTO, PlanetProps } from "./types";

export const mapPlanetApiToDomain = (input: PlanetApiResponse): Planet =>
  Planet.rehydrate({
    id: input.id,
    systemId: input.system_id,
    name: input.name,
    type: input.type,
    size: input.size,
    orbital: input.orbital,
    biome: input.biome,
    relativeMass: input.relative_mass,
    absoluteMass: input.absolute_mass,
    relativeRadius: input.relative_radius,
    absoluteRadius: input.absolute_radius,
    gravity: input.gravity,
    temperature: input.temperature,
  });

export const mapPlanetDomainToDTO = (planet: Planet): PlanetDTO => planet.toDB();

export const mapPlanetDomainToView = (planet: Planet): PlanetProps => planet.toJSON();
