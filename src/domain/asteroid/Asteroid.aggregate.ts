import { ErrorFactory } from "../../lib/errors/Error.map";
import { Uuid } from "../shared/Uuid.vo";
import {
  AsteroidName,
  AsteroidSizeValue,
  AsteroidTypeValue,
} from "./Asteroid.vo";
import { AsteroidCreateProps, AsteroidDTO, AsteroidSize, AsteroidProps, AsteroidType } from "../../types/asteroid.types";

type AsteroidState = {
  id: Uuid;
  systemId: Uuid;
  name: AsteroidName;
  type: AsteroidTypeValue;
  size: AsteroidSizeValue;
  orbital: number;
};

const ensureOrbital = (value: number): void => {
  const isValid =
    Number.isFinite(value) && value > 0 && Math.abs((value % 1) - 0.5) < 1e-9;

  if (!isValid) {
    throw ErrorFactory.domain("DOMAIN.INVALID_ASTEROID_ORBITAL", {
      orbital: value,
    });
  }
};

export class Asteroid {
  private props: AsteroidState;

  private constructor(props: AsteroidState) {
    this.props = { ...props };
  }

  static create(input: AsteroidCreateProps): Asteroid {
    ensureOrbital(input.orbital);

    return new Asteroid({
      id: Uuid.create(input.id),
      systemId: Uuid.create(input.systemId),
      name: AsteroidName.create(input.name),
      type: AsteroidTypeValue.create(input.type),
      size: AsteroidSizeValue.create(input.size),
      orbital: input.orbital,
    });
  }

  static rehydrate(props: AsteroidProps): Asteroid {
    return Asteroid.create({ ...props });
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

  get type(): AsteroidType {
    return this.props.type.toString();
  }

  get size(): AsteroidSize {
    return this.props.size.toString();
  }

  get orbital(): number {
    return this.props.orbital;
  }

  rename(value: string): void {
    const next = AsteroidName.create(value);
    if (!next.equals(this.props.name)) {
      this.props.name = next;
    }
  }

  changeType(value: AsteroidType): void {
    const next = AsteroidTypeValue.create(value);
    if (next.toString() !== this.props.type.toString()) {
      this.props.type = next;
    }
  }

  changeSize(value: AsteroidSize): void {
    const next = AsteroidSizeValue.create(value);
    if (next.toString() !== this.props.size.toString()) {
      this.props.size = next;
    }
  }

  changeOrbital(value: number): void {
    ensureOrbital(value);
    if (value !== this.props.orbital) {
      this.props.orbital = value;
    }
  }

  toJSON(): AsteroidProps {
    return {
      id: this.id,
      systemId: this.systemId,
      name: this.name,
      type: this.type,
      size: this.size,
      orbital: this.orbital,
    };
  }

  toDB(): AsteroidDTO {
    return {
      id: this.id,
      system_id: this.systemId,
      name: this.name,
      type: this.type,
      size: this.size,
      orbital: this.orbital,
    };
  }
}

