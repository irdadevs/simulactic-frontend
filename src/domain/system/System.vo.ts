import { REGEXP } from "../../lib/Regexp.map";
import { ErrorFactory } from "../../lib/errors/Error.map";
import { SystemPosition } from "../../types/system.types";

export class SystemName {
  private constructor(private readonly value: string) {}

  static create(value: string): SystemName {
    const normalized = value.trim();
    if (!REGEXP.systemName.test(normalized)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_SYSTEM_NAME", {
        name: value,
      });
    }
    return new SystemName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: SystemName): boolean {
    return this.value === other.value;
  }
}

export class SystemPositionValue {
  private constructor(private readonly value: SystemPosition) {}

  static create(value: SystemPosition): SystemPositionValue {
    const isValid =
      Number.isFinite(value.x) &&
      Number.isFinite(value.y) &&
      Number.isFinite(value.z);

    if (!isValid) {
      throw ErrorFactory.domain("DOMAIN.INVALID_SYSTEM_POSITION", {
        position: `${value.x},${value.y},${value.z}`,
      });
    }

    return new SystemPositionValue({ ...value });
  }

  toJSON(): SystemPosition {
    return { ...this.value };
  }

  equals(other: SystemPositionValue): boolean {
    return (
      this.value.x === other.value.x &&
      this.value.y === other.value.y &&
      this.value.z === other.value.z
    );
  }
}

