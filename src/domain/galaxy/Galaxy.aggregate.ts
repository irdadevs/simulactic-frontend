import { Uuid } from "../shared/Uuid.vo";
import {
  GalaxyCreateProps,
  GalaxyDTO,
  GalaxyProps,
  GalaxyShapeValue,
} from "../../types/galaxy.types";
import { ALLOWED_GALAXY_SHAPES, GalaxyName, GalaxyShape } from "./Galaxy.vo";

type GalaxyState = {
  id: Uuid;
  ownerId: Uuid;
  name: GalaxyName;
  shape: GalaxyShape;
  systemCount: number;
  createdAt: Date;
};

export class Galaxy {
  private static readonly MIN_SYSTEM_COUNT = 1;
  private static readonly MAX_SYSTEM_COUNT = 1000;

  private props: GalaxyState;

  private constructor(props: GalaxyState) {
    this.props = { ...props };
  }

  static create(input: GalaxyCreateProps): Galaxy {
    const shape = input.shape ?? Galaxy.sampleShape();

    return new Galaxy({
      id: Uuid.create(input.id),
      ownerId: Uuid.create(input.ownerId),
      name: GalaxyName.create(input.name),
      shape: GalaxyShape.create(shape),
      systemCount: Galaxy.normalizeSystemCount(input.systemCount),
      createdAt: input.createdAt ?? new Date(),
    });
  }

  static rehydrate(props: GalaxyProps): Galaxy {
    return new Galaxy({
      id: Uuid.create(props.id),
      ownerId: Uuid.create(props.ownerId),
      name: GalaxyName.create(props.name),
      shape: GalaxyShape.create(props.shape),
      systemCount: Galaxy.normalizeSystemCount(props.systemCount),
      createdAt: props.createdAt,
    });
  }

  private static sampleShape(): GalaxyShapeValue {
    return ALLOWED_GALAXY_SHAPES[
      Math.floor(Math.random() * ALLOWED_GALAXY_SHAPES.length)
    ];
  }

  private static normalizeSystemCount(value: number): number {
    if (value < Galaxy.MIN_SYSTEM_COUNT) {
      return Galaxy.MIN_SYSTEM_COUNT;
    }
    if (value > Galaxy.MAX_SYSTEM_COUNT) {
      return Galaxy.MAX_SYSTEM_COUNT;
    }
    return value;
  }

  get id(): string {
    return this.props.id.toString();
  }

  get ownerId(): string {
    return this.props.ownerId.toString();
  }

  get name(): string {
    return this.props.name.toString();
  }

  get shape(): GalaxyShapeValue {
    return this.props.shape.toString();
  }

  get systemCount(): number {
    return this.props.systemCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  rename(value: string): void {
    const next = GalaxyName.create(value);
    if (!next.equals(this.props.name)) {
      this.props.name = next;
    }
  }

  changeShape(value: string): void {
    const next = GalaxyShape.create(value);
    if (!next.equals(this.props.shape)) {
      this.props.shape = next;
    }
  }

  changeSystemCount(value: number): void {
    const normalized = Galaxy.normalizeSystemCount(value);
    if (normalized !== this.props.systemCount) {
      this.props.systemCount = normalized;
    }
  }

  toJSON(): GalaxyProps {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      shape: this.shape,
      systemCount: this.systemCount,
      createdAt: this.createdAt,
    };
  }

  toDB(): GalaxyDTO {
    return {
      id: this.id,
      owner_id: this.ownerId,
      name: this.name,
      shape: this.shape,
      system_count: this.systemCount,
      created_at: this.createdAt,
    };
  }
}

