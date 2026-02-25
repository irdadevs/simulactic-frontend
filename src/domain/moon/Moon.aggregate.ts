import { ErrorFactory } from "../../lib/errors/Error.map";
import { Uuid } from "../shared/Uuid.vo";
import { MoonName, MoonSizeValue } from "./Moon.vo";
import { MoonCreateProps, MoonDTO, MoonProps } from "./types";

type MoonState = {
  id: Uuid;
  planetId: Uuid;
  name: MoonName;
  size: MoonSizeValue;
  orbital: number;
  relativeMass: number;
  absoluteMass: number;
  relativeRadius: number;
  absoluteRadius: number;
  gravity: number;
  temperature: number;
};

const ensurePositive = (field: string, value: number): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw ErrorFactory.domain("DOMAIN.INVALID_MOON_VALUE", { field });
  }
};

const ensureOrbital = (value: number): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw ErrorFactory.domain("DOMAIN.INVALID_MOON_ORBITAL", {
      orbital: value,
    });
  }
};

const ensureNonNegative = (field: string, value: number): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw ErrorFactory.domain("DOMAIN.INVALID_MOON_VALUE", { field });
  }
};

export class Moon {
  private props: MoonState;

  private constructor(props: MoonState) {
    this.props = { ...props };
  }

  static create(input: MoonCreateProps): Moon {
    ensureOrbital(input.orbital);
    ensurePositive("relativeMass", input.relativeMass);
    ensurePositive("absoluteMass", input.absoluteMass);
    ensurePositive("relativeRadius", input.relativeRadius);
    ensurePositive("absoluteRadius", input.absoluteRadius);
    ensureNonNegative("gravity", input.gravity);
    ensurePositive("temperature", input.temperature);

    return new Moon({
      id: Uuid.create(input.id),
      planetId: Uuid.create(input.planetId),
      name: MoonName.create(input.name),
      size: MoonSizeValue.create(input.size),
      orbital: input.orbital,
      relativeMass: input.relativeMass,
      absoluteMass: input.absoluteMass,
      relativeRadius: input.relativeRadius,
      absoluteRadius: input.absoluteRadius,
      gravity: input.gravity,
      temperature: input.temperature,
    });
  }

  static rehydrate(props: MoonProps): Moon {
    return Moon.create({ ...props });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get planetId(): string {
    return this.props.planetId.toString();
  }

  get name(): string {
    return this.props.name.toString();
  }

  get size() {
    return this.props.size.toString();
  }

  get orbital(): number {
    return this.props.orbital;
  }

  get relativeMass(): number {
    return this.props.relativeMass;
  }

  get absoluteMass(): number {
    return this.props.absoluteMass;
  }

  get relativeRadius(): number {
    return this.props.relativeRadius;
  }

  get absoluteRadius(): number {
    return this.props.absoluteRadius;
  }

  get gravity(): number {
    return this.props.gravity;
  }

  get temperature(): number {
    return this.props.temperature;
  }

  rename(value: string): void {
    const next = MoonName.create(value);
    if (!next.equals(this.props.name)) {
      this.props.name = next;
    }
  }

  changeOrbital(value: number): void {
    ensureOrbital(value);
    if (value !== this.props.orbital) {
      this.props.orbital = value;
    }
  }

  toJSON(): MoonProps {
    return {
      id: this.id,
      planetId: this.planetId,
      name: this.name,
      size: this.size,
      orbital: this.orbital,
      relativeMass: this.relativeMass,
      absoluteMass: this.absoluteMass,
      relativeRadius: this.relativeRadius,
      absoluteRadius: this.absoluteRadius,
      gravity: this.gravity,
      temperature: this.temperature,
    };
  }

  toDB(): MoonDTO {
    return {
      id: this.id,
      planet_id: this.planetId,
      name: this.name,
      size: this.size,
      orbital: this.orbital,
      relative_mass: this.relativeMass,
      absolute_mass: this.absoluteMass,
      relative_radius: this.relativeRadius,
      absolute_radius: this.absoluteRadius,
      gravity: this.gravity,
      temperature: this.temperature,
    };
  }
}
