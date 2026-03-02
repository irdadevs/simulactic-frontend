import { DomainError } from "../../lib/errors/Errors.base";
import { Asteroid } from "../../domain/asteroid/Asteroid.aggregate";
import {
  AsteroidName,
  AsteroidSizeValue,
  AsteroidTypeValue,
} from "../../domain/asteroid/Asteroid.vo";
import {
  mapAsteroidApiToDomain,
  mapAsteroidDomainToDTO,
  mapAsteroidDomainToView,
} from "../../domain/asteroid/mappers";

describe("Asteroid aggregate", () => {
  const systemId = "11111111-1111-4111-8111-111111111111";
  const asteroidId = "22222222-2222-4222-8222-222222222222";

  const asteroidProps = {
    id: asteroidId,
    systemId,
    name: "Rock-1",
    type: "single" as const,
    size: "small" as const,
    orbital: 1.5,
  };

  it("creates and mutates lifecycle state", () => {
    const aggregate = Asteroid.create(asteroidProps);

    aggregate.rename("Rock-2");
    aggregate.changeType("cluster");
    aggregate.changeSize("big");
    aggregate.changeOrbital(2.5);

    expect(aggregate.toJSON()).toEqual({
      ...asteroidProps,
      name: "Rock-2",
      type: "cluster",
      size: "big",
      orbital: 2.5,
    });
  });

  it("maps api/domain/dto", () => {
    const aggregate = mapAsteroidApiToDomain({
      id: asteroidId,
      systemId,
      name: "Rock-3",
      type: "cluster",
      size: "massive",
      orbital: 4.5,
    });

    expect(mapAsteroidDomainToView(aggregate).name).toBe("Rock-3");
    expect(mapAsteroidDomainToDTO(aggregate).system_id).toBe(systemId);
  });

  it("throws on non-half orbital", () => {
    try {
      Asteroid.create({ ...asteroidProps, orbital: 2 });
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_ASTEROID_ORBITAL");
    }
  });
});

describe("Asteroid value objects", () => {
  it("validates asteroid VOs", () => {
    expect(AsteroidName.create("  Belt-1  ").toString()).toBe("Belt-1");
    expect(AsteroidTypeValue.create("single").toString()).toBe("single");
    expect(AsteroidSizeValue.create("medium").toString()).toBe("medium");
  });

  it("throws on invalid asteroid type", () => {
    try {
      AsteroidTypeValue.create("ring");
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_ASTEROID_TYPE");
    }
  });
});
