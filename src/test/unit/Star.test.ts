import { DomainError } from "../../lib/errors/Errors.base";
import { Star } from "../../domain/star/Star.aggregate";
import {
  StarClassValue,
  STAR_CLASS_COLOR,
  StarName,
  StarTypeValue,
} from "../../domain/star/Star.vo";
import {
  mapStarApiToDomain,
  mapStarDomainToDTO,
  mapStarDomainToView,
} from "../../domain/star/mappers";

describe("Star aggregate", () => {
  const systemId = "11111111-1111-4111-8111-111111111111";
  const starId = "22222222-2222-4222-8222-222222222222";

  const starProps = {
    id: starId,
    systemId,
    name: "Helios-1",
    starType: "Yellow dwarf" as const,
    starClass: "G" as const,
    surfaceTemperature: 5778,
    color: "yellow" as const,
    relativeMass: 1,
    relativeRadius: 1,
    isMain: true,
    orbital: 0,
    orbitalStarter: 1,
  };

  it("creates and mutates lifecycle state", () => {
    const aggregate = Star.create(starProps);

    aggregate.rename("Helios-2");
    aggregate.changeMainStatus(false);
    aggregate.changeOrbital(1);
    aggregate.changeOrbitalStarter(2);

    expect(aggregate.toJSON()).toEqual({
      ...starProps,
      name: "Helios-2",
      isMain: false,
      orbital: 1,
      orbitalStarter: 2,
    });
  });

  it("maps api/domain/dto", () => {
    const aggregate = mapStarApiToDomain({
      id: starId,
      systemId,
      name: "Helios-3",
      starType: "Blue giant",
      starClass: "B",
      surfaceTemperature: 12000,
      color: "blue-white",
      relativeMass: 8,
      relativeRadius: 4,
      isMain: false,
      orbital: 1,
      orbitalStarter: 3,
    });

    expect(mapStarDomainToView(aggregate).name).toBe("Helios-3");
    expect(mapStarDomainToDTO(aggregate).system_id).toBe(systemId);
  });

  it("throws on invalid star class for type", () => {
    try {
      Star.create({
        ...starProps,
        starType: "Yellow dwarf",
        starClass: "B",
        color: STAR_CLASS_COLOR.B,
      });
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_STAR_CLASS");
    }
  });
});

describe("Star value objects", () => {
  it("validates type, class and name", () => {
    expect(StarTypeValue.create("Blue giant").toString()).toBe("Blue giant");
    expect(StarClassValue.create("G").toString()).toBe("G");
    expect(StarName.create("  Sun-1  ").toString()).toBe("Sun-1");
  });

  it("throws on invalid name", () => {
    try {
      StarName.create("x");
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_STAR_VALUE");
    }
  });
});
