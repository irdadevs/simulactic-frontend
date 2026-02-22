import { DomainError } from "../../../lib/errors/Errors.base";
import { Galaxy } from "../../../domain/galaxy/Galaxy.aggregate";
import {
  ALLOWED_GALAXY_SHAPES,
  GalaxyName,
  GalaxyShape,
} from "../../../domain/galaxy/Galaxy.vo";
import {
  mapGalaxyApiToDomain,
  mapGalaxyDomainToDTO,
  mapGalaxyDomainToView,
} from "../../../domain/galaxy/mappers";

describe("Galaxy aggregate", () => {
  const ownerId = "11111111-1111-4111-8111-111111111111";
  const galaxyId = "22222222-2222-4222-8222-222222222222";

  it("creates galaxy and enforces systemCount bounds", () => {
    const galaxy = Galaxy.create({
      id: galaxyId,
      ownerId,
      name: "Andro5",
      shape: "spherical",
      systemCount: 0,
    });

    expect(galaxy.id).toBe(galaxyId);
    expect(galaxy.ownerId).toBe(ownerId);
    expect(galaxy.name).toBe("Andro5");
    expect(galaxy.shape).toBe("spherical");
    expect(galaxy.systemCount).toBe(1);
    expect(galaxy.createdAt).toBeInstanceOf(Date);

    const capped = Galaxy.create({
      id: "33333333-3333-4333-8333-333333333333",
      ownerId,
      name: "Andro6",
      shape: "spherical",
      systemCount: 99999,
    });

    expect(capped.systemCount).toBe(1000);
  });

  it("rehydrates from existing persisted state and enforces bounds", () => {
    const createdAt = new Date("2026-02-22T00:00:00.000Z");
    const galaxy = Galaxy.rehydrate({
      id: galaxyId,
      ownerId,
      name: "Milky-1",
      shape: "irregular",
      systemCount: 7,
      createdAt,
    });

    expect(galaxy.toJSON()).toEqual({
      id: galaxyId,
      ownerId,
      name: "Milky-1",
      shape: "irregular",
      systemCount: 7,
      createdAt,
    });

    const capped = Galaxy.rehydrate({
      id: "44444444-4444-4444-8444-444444444444",
      ownerId,
      name: "Milky-2",
      shape: "irregular",
      systemCount: 7000,
      createdAt,
    });

    expect(capped.systemCount).toBe(1000);
  });

  it("renames only when value changes", () => {
    const galaxy = Galaxy.create({
      id: galaxyId,
      ownerId,
      name: "Alpha1",
      shape: "spherical",
      systemCount: 3,
    });

    galaxy.rename("Beta-2");
    expect(galaxy.name).toBe("Beta-2");

    galaxy.rename("Beta-2");
    expect(galaxy.name).toBe("Beta-2");
  });

  it("changes shape when valid", () => {
    const galaxy = Galaxy.create({
      id: galaxyId,
      ownerId,
      name: "Gamma9",
      shape: "spherical",
      systemCount: 3,
    });

    galaxy.changeShape("5-arm spiral");
    expect(galaxy.shape).toBe("5-arm spiral");
  });

  it("changes system count with lower and upper bounds", () => {
    const galaxy = Galaxy.create({
      id: galaxyId,
      ownerId,
      name: "Delta7",
      shape: "spherical",
      systemCount: 2,
    });

    galaxy.changeSystemCount(12);
    expect(galaxy.systemCount).toBe(12);

    galaxy.changeSystemCount(-10);
    expect(galaxy.systemCount).toBe(1);

    galaxy.changeSystemCount(9999);
    expect(galaxy.systemCount).toBe(1000);
  });

  it("serializes to backend DTO fields", () => {
    const createdAt = new Date("2026-02-22T00:00:00.000Z");
    const galaxy = Galaxy.rehydrate({
      id: galaxyId,
      ownerId,
      name: "Omega5",
      shape: "3-arm spiral",
      systemCount: 4,
      createdAt,
    });

    expect(galaxy.toDB()).toEqual({
      id: galaxyId,
      owner_id: ownerId,
      name: "Omega5",
      shape: "3-arm spiral",
      system_count: 4,
      created_at: createdAt,
    });
  });

  it("throws domain error on invalid shape", () => {
    try {
      Galaxy.create({
        id: galaxyId,
        ownerId,
        name: "Theta9",
        shape: "ring",
        systemCount: 2,
      });
      fail("Expected error was not thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_GALAXY_SHAPE");
    }
  });

  it("throws domain error on invalid name", () => {
    try {
      Galaxy.create({
        id: galaxyId,
        ownerId,
        name: "ab",
        shape: "spherical",
        systemCount: 2,
      });
      fail("Expected error was not thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_GALAXY_NAME");
    }
  });

  it("throws domain error on invalid owner id", () => {
    try {
      Galaxy.create({
        id: galaxyId,
        ownerId: "not-uuid",
        name: "Sigma9",
        shape: "spherical",
        systemCount: 2,
      });
      fail("Expected error was not thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_USER_ID");
    }
  });
});

describe("Galaxy mappers", () => {
  const ownerId = "11111111-1111-4111-8111-111111111111";
  const galaxyId = "22222222-2222-4222-8222-222222222222";

  it("maps backend API payload to domain aggregate", () => {
    const aggregate = mapGalaxyApiToDomain({
      id: galaxyId,
      owner_id: ownerId,
      name: "Androm",
      shape: "spherical",
      system_count: 5,
      created_at: "2026-02-22T00:00:00.000Z",
    });

    expect(aggregate).toBeInstanceOf(Galaxy);
    expect(aggregate.toJSON()).toEqual({
      id: galaxyId,
      ownerId,
      name: "Androm",
      shape: "spherical",
      systemCount: 5,
      createdAt: new Date("2026-02-22T00:00:00.000Z"),
    });
  });

  it("maps domain aggregate to dto", () => {
    const createdAt = new Date("2026-02-22T00:00:00.000Z");
    const aggregate = Galaxy.rehydrate({
      id: galaxyId,
      ownerId,
      name: "Androm",
      shape: "3-arm spiral",
      systemCount: 8,
      createdAt,
    });

    expect(mapGalaxyDomainToDTO(aggregate)).toEqual({
      id: galaxyId,
      owner_id: ownerId,
      name: "Androm",
      shape: "3-arm spiral",
      system_count: 8,
      created_at: createdAt,
    });
  });

  it("maps domain aggregate to view", () => {
    const createdAt = new Date("2026-02-22T00:00:00.000Z");
    const aggregate = Galaxy.rehydrate({
      id: galaxyId,
      ownerId,
      name: "Androm",
      shape: "irregular",
      systemCount: 3,
      createdAt,
    });

    expect(mapGalaxyDomainToView(aggregate)).toEqual({
      id: galaxyId,
      ownerId,
      name: "Androm",
      shape: "irregular",
      systemCount: 3,
      createdAt,
    });
  });

  it("throws domain error on invalid date from api payload", () => {
    try {
      mapGalaxyApiToDomain({
        id: galaxyId,
        owner_id: ownerId,
        name: "Androm",
        shape: "spherical",
        system_count: 5,
        created_at: "not-a-date",
      });
      fail("Expected error was not thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe("DOMAIN.INVALID_DATE");
    }
  });
});

describe("Galaxy value objects", () => {
  describe("GalaxyName", () => {
    it("creates normalized valid name", () => {
      const vo = GalaxyName.create("  Orion5  ");
      expect(vo.toString()).toBe("Orion5");
    });

    it("supports equality", () => {
      const left = GalaxyName.create("Nova-1");
      const right = GalaxyName.create("Nova-1");
      const other = GalaxyName.create("Nova-2");

      expect(left.equals(right)).toBe(true);
      expect(left.equals(other)).toBe(false);
    });

    it("throws domain error on invalid value", () => {
      try {
        GalaxyName.create("ab");
        fail("Expected error was not thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
        expect((error as DomainError).code).toBe("DOMAIN.INVALID_GALAXY_NAME");
      }
    });
  });

  describe("GalaxyShape", () => {
    it("accepts every allowed shape", () => {
      ALLOWED_GALAXY_SHAPES.forEach((shape) => {
        const vo = GalaxyShape.create(shape);
        expect(vo.toString()).toBe(shape);
      });
    });

    it("supports equality", () => {
      const left = GalaxyShape.create("spherical");
      const right = GalaxyShape.create("spherical");
      const other = GalaxyShape.create("irregular");

      expect(left.equals(right)).toBe(true);
      expect(left.equals(other)).toBe(false);
    });

    it("throws domain error on invalid shape", () => {
      try {
        GalaxyShape.create("ring");
        fail("Expected error was not thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
        expect((error as DomainError).code).toBe("DOMAIN.INVALID_GALAXY_SHAPE");
      }
    });
  });
});
