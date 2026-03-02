import { Asteroid } from "./Asteroid.aggregate";
import { AsteroidApiResponse, AsteroidDTO, AsteroidProps } from "../../types/asteroid.types";

export const mapAsteroidApiToDomain = (input: AsteroidApiResponse): Asteroid =>
  Asteroid.rehydrate({
    id: input.id,
    systemId: input.systemId,
    name: input.name,
    type: input.type,
    size: input.size,
    orbital: input.orbital,
  });

export const mapAsteroidDomainToDTO = (asteroid: Asteroid): AsteroidDTO =>
  asteroid.toDB();

export const mapAsteroidDomainToView = (asteroid: Asteroid): AsteroidProps =>
  asteroid.toJSON();

