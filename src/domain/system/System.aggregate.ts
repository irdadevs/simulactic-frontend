import { Uuid } from "../shared/Uuid.vo";
import { SystemName, SystemPositionValue } from "./System.vo";
import { SystemCreateProps, SystemDTO, SystemPosition, SystemProps } from "../../types/system.types";

type SystemState = {
  id: Uuid;
  galaxyId: Uuid;
  name: SystemName;
  position: SystemPositionValue;
};

export class System {
  private props: SystemState;

  private constructor(props: SystemState) {
    this.props = { ...props };
  }

  static create(input: SystemCreateProps): System {
    return new System({
      id: Uuid.create(input.id),
      galaxyId: Uuid.create(input.galaxyId),
      name: SystemName.create(input.name),
      position: SystemPositionValue.create(input.position),
    });
  }

  static rehydrate(props: SystemProps): System {
    return new System({
      id: Uuid.create(props.id),
      galaxyId: Uuid.create(props.galaxyId),
      name: SystemName.create(props.name),
      position: SystemPositionValue.create(props.position),
    });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get galaxyId(): string {
    return this.props.galaxyId.toString();
  }

  get name(): string {
    return this.props.name.toString();
  }

  get position(): SystemPosition {
    return this.props.position.toJSON();
  }

  rename(value: string): void {
    const next = SystemName.create(value);
    if (!next.equals(this.props.name)) {
      this.props.name = next;
    }
  }

  move(value: SystemPosition): void {
    const next = SystemPositionValue.create(value);
    if (!next.equals(this.props.position)) {
      this.props.position = next;
    }
  }

  toJSON(): SystemProps {
    return {
      id: this.id,
      galaxyId: this.galaxyId,
      name: this.name,
      position: this.position,
    };
  }

  toDB(): SystemDTO {
    return {
      id: this.id,
      galaxy_id: this.galaxyId,
      name: this.name,
      position_x: this.position.x,
      position_y: this.position.y,
      position_z: this.position.z,
    };
  }
}

