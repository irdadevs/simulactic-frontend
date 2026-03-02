import { DomainError } from "../../lib/errors/Errors.base";
import { System } from "../../domain/system/System.aggregate";
import { SystemName, SystemPositionValue } from "../../domain/system/System.vo";
import {
  mapSystemApiToDomain,
  mapSystemDomainToDTO,
  mapSystemDomainToView,
} from "../../domain/system/mappers";

describe("System aggregate", () => {
  const galaxyId = "11111111-1111-4111-8111-111111111111";
  const systemId = "22222222-2222-4222-8222-222222222222";

  it("creates and mutates lifecycle state", () => {
    const aggregate = System.create({
      id: systemId,
      galaxyId,
      name: "Sol-1",
      position: { x: 1, y: 2, z: 3 },
    });

    aggregate.rename("Sol-2");
    aggregate.move({ x: 4, y: 5, z: 6 });

    expect(aggregate.toJSON()).toEqual({
      id: systemId,
      galaxyId,
      name: "Sol-2",
      position: { x: 4, y: 5, z: 6 },
    });
  });

  it("maps api/domain/dto", () => {
    const aggregate = mapSystemApiToDomain({
      id: systemId,
      galaxyId,
      name: "Sol-3",
      position: { x: 10, y: 11, z: 12 },
    });

    expect(mapSystemDomainToView(aggregate)).toEqual({
      id: systemId,
      galaxyId,
      name: "Sol-3",
      position: { x: 10, y: 11, z: 12 },
    });

    expect(mapSystemDomainToDTO(aggregate)).toEqual({
      id: systemId,
      galaxy_id: galaxyId,
      name: "Sol-3",
      position_x: 10,
      position_y: 11,
      position_z: 12,
    });
  });

  it("throws on invalid position", () => {
    try {
      System.create({
        id: systemId,
        galaxyId,
        name: "Sol-1",
        position: { x: Number.NaN, y: 2, z: 3 },
      });
      fail("Expected error was not thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_SYSTEM_POSITION");
    }
  });
});

describe("System value objects", () => {
  it("normalizes and validates names", () => {
    expect(SystemName.create("  Sys-1  ").toString()).toBe("Sys-1");

    try {
      SystemName.create("x");
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_SYSTEM_NAME");
    }
  });

  it("supports position equality", () => {
    const left = SystemPositionValue.create({ x: 1, y: 2, z: 3 });
    const right = SystemPositionValue.create({ x: 1, y: 2, z: 3 });
    const other = SystemPositionValue.create({ x: 1, y: 2, z: 4 });

    expect(left.equals(right)).toBe(true);
    expect(left.equals(other)).toBe(false);
  });
});
