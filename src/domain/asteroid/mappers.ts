import { Asteroid } from "./Asteroid.aggregate";
import { AsteroidApiResponse, AsteroidDTO, AsteroidProps } from "./types";

export const mapAsteroidApiToDomain = (input: AsteroidApiResponse): Asteroid =>
  Asteroid.rehydrate({
    id: input.id,
    systemId: input.system_id,
    name: input.name,
    type: input.type,
    size: input.size,
    orbital: input.orbital,
  });

export const mapAsteroidDomainToDTO = (asteroid: Asteroid): AsteroidDTO =>
  asteroid.toDB();

export const mapAsteroidDomainToView = (asteroid: Asteroid): AsteroidProps =>
  asteroid.toJSON();
