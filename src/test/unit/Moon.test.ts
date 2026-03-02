import { DomainError } from "../../lib/errors/Errors.base";
import { Moon } from "../../domain/moon/Moon.aggregate";
import { MoonName, MoonSizeValue } from "../../domain/moon/Moon.vo";
import {
  mapMoonApiToDomain,
  mapMoonDomainToDTO,
  mapMoonDomainToView,
} from "../../domain/moon/mappers";

describe("Moon aggregate", () => {
  const planetId = "11111111-1111-4111-8111-111111111111";
  const moonId = "22222222-2222-4222-8222-222222222222";

  const moonProps = {
    id: moonId,
    planetId,
    name: "Luna-1",
    size: "medium" as const,
    orbital: 1,
    relativeMass: 1,
    relativeRadius: 1,
    temperature: 220,
  };

  it("creates and mutates lifecycle state", () => {
    const aggregate = Moon.create(moonProps);

    aggregate.rename("Luna-2");
    aggregate.changeOrbital(2);

    expect(aggregate.toJSON()).toEqual({
      ...moonProps,
      name: "Luna-2",
      orbital: 2,
    });
  });

  it("maps api/domain/dto", () => {
    const aggregate = mapMoonApiToDomain({
      id: moonId,
      planetId,
      name: "Luna-3",
      size: "giant",
      orbital: 3,
      relativeMass: 2,
      relativeRadius: 1.4,
      temperature: 150,
    });

    expect(mapMoonDomainToView(aggregate).name).toBe("Luna-3");
    expect(mapMoonDomainToDTO(aggregate).planet_id).toBe(planetId);
  });

  it("throws on invalid orbital", () => {
    try {
      Moon.create({ ...moonProps, orbital: 0 });
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_MOON_ORBITAL");
    }
  });
});

describe("Moon value objects", () => {
  it("validates moon VOs", () => {
    expect(MoonName.create("  Luna-1  ").toString()).toBe("Luna-1");
    expect(MoonSizeValue.create("dwarf").toString()).toBe("dwarf");
  });

  it("throws on invalid moon size", () => {
    try {
      MoonSizeValue.create("huge");
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_MOON_SIZE");
    }
  });
});
