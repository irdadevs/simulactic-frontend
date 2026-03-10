import { DomainError } from "../../lib/errors/Errors.base";
import { Planet } from "../../domain/planet/Planet.aggregate";
import {
  PlanetBiomeValue,
  PlanetName,
  PlanetSizeValue,
  PlanetTypeValue,
} from "../../domain/planet/Planet.vo";
import {
  mapPlanetApiToDomain,
  mapPlanetDomainToDTO,
  mapPlanetDomainToView,
} from "../../domain/planet/mappers";

describe("Planet aggregate", () => {
  const systemId = "11111111-1111-4111-8111-111111111111";
  const planetId = "22222222-2222-4222-8222-222222222222";

  const planetProps = {
    id: planetId,
    systemId,
    name: "Terra-1",
    type: "solid" as const,
    size: "medium" as const,
    orbital: 2,
    biome: "temperate" as const,
    relativeMass: 1,
    relativeRadius: 1,
    temperature: 288,
  };

  it("creates and mutates lifecycle state", () => {
    const aggregate = Planet.create(planetProps);

    aggregate.rename("Terra-2");
    aggregate.changeBiome("ocean");
    aggregate.changeOrbital(3);

    expect(aggregate.toJSON()).toEqual({
      ...planetProps,
      name: "Terra-2",
      biome: "ocean",
      orbital: 3,
    });
  });

  it("maps api/domain/dto", () => {
    const aggregate = mapPlanetApiToDomain({
      id: planetId,
      systemId,
      name: "Terra-3",
      type: "gas",
      size: "giant",
      orbital: 5,
      biome: "none",
      relativeMass: 20,
      relativeRadius: 4,
      temperature: 320,
    });

    expect(mapPlanetDomainToView(aggregate).name).toBe("Terra-3");
    expect(mapPlanetDomainToDTO(aggregate).system_id).toBe(systemId);
  });

  it("throws on invalid orbital", () => {
    try {
      Planet.create({ ...planetProps, orbital: 0 });
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_PLANET_VALUE");
    }
  });
});

describe("Planet value objects", () => {
  it("validates planet VOs", () => {
    expect(PlanetName.create("  Terra-1  ").toString()).toBe("Terra-1");
    expect(PlanetTypeValue.create("solid").toString()).toBe("solid");
    expect(PlanetSizeValue.create("medium").toString()).toBe("medium");
    expect(PlanetBiomeValue.create("desert").toString()).toBe("desert");
    expect(PlanetBiomeValue.create("none").toString()).toBe("none");
  });

  it("throws on invalid planet type", () => {
    try {
      PlanetTypeValue.create("rocky");
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_PLANET_TYPE");
    }
  });
});
