import { ErrorFactory } from "../../lib/errors/Error.map";
import { Uuid } from "../shared/Uuid.vo";
import {
  PlanetBiomeValue,
  PlanetName,
  PlanetSizeValue,
  PlanetTypeValue,
} from "./Planet.vo";
import { PlanetBiome, PlanetCreateProps, PlanetDTO, PlanetProps } from "../../types/planet.types";

type PlanetState = {
  id: Uuid;
  systemId: Uuid;
  name: PlanetName;
  type: PlanetTypeValue;
  size: PlanetSizeValue;
  orbital: number;
  biome: PlanetBiomeValue;
  relativeMass: number;
  relativeRadius: number;
  temperature: number;
};

const ensurePositive = (field: string, value: number): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw ErrorFactory.domain("DOMAIN.INVALID_PLANET_VALUE", { field });
  }
};

const ensureNonNegative = (field: string, value: number): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw ErrorFactory.domain("DOMAIN.INVALID_PLANET_VALUE", { field });
  }
};

export class Planet {
  private props: PlanetState;

  private constructor(props: PlanetState) {
    this.props = { ...props };
  }

  static create(input: PlanetCreateProps): Planet {
    ensurePositive("orbital", input.orbital);
    ensurePositive("relativeMass", input.relativeMass);
    ensurePositive("relativeRadius", input.relativeRadius);
    ensurePositive("temperature", input.temperature);

    return new Planet({
      id: Uuid.create(input.id),
      systemId: Uuid.create(input.systemId),
      name: PlanetName.create(input.name),
      type: PlanetTypeValue.create(input.type),
      size: PlanetSizeValue.create(input.size),
      orbital: input.orbital,
      biome: PlanetBiomeValue.create(input.biome),
      relativeMass: input.relativeMass,
      relativeRadius: input.relativeRadius,
      temperature: input.temperature,
    });
  }

  static rehydrate(props: PlanetProps): Planet {
    return Planet.create({ ...props });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get systemId(): string {
    return this.props.systemId.toString();
  }

  get name(): string {
    return this.props.name.toString();
  }

  get type() {
    return this.props.type.toString();
  }

  get size() {
    return this.props.size.toString();
  }

  get orbital(): number {
    return this.props.orbital;
  }

  get biome() {
    return this.props.biome.toString();
  }

  get relativeMass(): number {
    return this.props.relativeMass;
  }

  get relativeRadius(): number {
    return this.props.relativeRadius;
  }

  get temperature(): number {
    return this.props.temperature;
  }

  rename(value: string): void {
    const next = PlanetName.create(value);
    if (!next.equals(this.props.name)) {
      this.props.name = next;
    }
  }

  changeBiome(value: PlanetBiome): void {
    const next = PlanetBiomeValue.create(value);
    if (next.toString() !== this.props.biome.toString()) {
      this.props.biome = next;
    }
  }

  changeOrbital(value: number): void {
    ensurePositive("orbital", value);
    if (value !== this.props.orbital) {
      this.props.orbital = value;
    }
  }

  toJSON(): PlanetProps {
    return {
      id: this.id,
      systemId: this.systemId,
      name: this.name,
      type: this.type,
      size: this.size,
      orbital: this.orbital,
      biome: this.biome,
      relativeMass: this.relativeMass,
      relativeRadius: this.relativeRadius,
      temperature: this.temperature,
    };
  }

  toDB(): PlanetDTO {
    return {
      id: this.id,
      system_id: this.systemId,
      name: this.name,
      type: this.type,
      size: this.size,
      orbital: this.orbital,
      biome: this.biome,
      relative_mass: this.relativeMass,
      relative_radius: this.relativeRadius,
      temperature: this.temperature,
    };
  }
}

