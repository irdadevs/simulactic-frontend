import { ErrorFactory } from "../../lib/errors/Error.map";
import { Uuid } from "../shared/Uuid.vo";
import {
  StarClassValue,
  StarColorValue,
  StarName,
  STAR_CLASS_COLOR,
  StarTypeValue,
} from "./Star.vo";
import { StarCreateProps, StarDTO, StarProps } from "./types";

type StarState = {
  id: Uuid;
  systemId: Uuid;
  name: StarName;
  starType: StarTypeValue;
  starClass: StarClassValue;
  surfaceTemperature: number;
  color: StarColorValue;
  relativeMass: number;
  absoluteMass: number;
  relativeRadius: number;
  absoluteRadius: number;
  gravity: number;
  isMain: boolean;
  orbital: number;
  orbitalStarter: number;
};

const STAR_TYPE_CLASS = {
  "Blue supergiant": "O",
  "Blue giant": "B",
  "White dwarf": "A",
  "Brown dwarf": "M",
  "Yellow dwarf": "G",
  Subdwarf: "K",
  "Red dwarf": "M",
  "Black hole": "BH",
  "Neutron star": "N",
} as const;

const ensurePositive = (field: string, value: number): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw ErrorFactory.domain("DOMAIN.INVALID_STAR_VALUE", { field });
  }
};

const ensureNonNegative = (field: string, value: number): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw ErrorFactory.domain("DOMAIN.INVALID_STAR_VALUE", { field });
  }
};

export class Star {
  private props: StarState;

  private constructor(props: StarState) {
    this.props = { ...props };
  }

  static create(input: StarCreateProps): Star {
    ensurePositive("surfaceTemperature", input.surfaceTemperature);
    ensurePositive("relativeMass", input.relativeMass);
    ensurePositive("absoluteMass", input.absoluteMass);
    ensurePositive("relativeRadius", input.relativeRadius);
    ensurePositive("absoluteRadius", input.absoluteRadius);
    ensureNonNegative("gravity", input.gravity);
    ensureNonNegative("orbital", input.orbital);
    ensureNonNegative("orbitalStarter", input.orbitalStarter);

    const starType = StarTypeValue.create(input.starType);
    const starClass = StarClassValue.create(input.starClass);
    const expectedClass = STAR_TYPE_CLASS[starType.toString()];

    if (starClass.toString() !== expectedClass) {
      throw ErrorFactory.domain("DOMAIN.INVALID_STAR_CLASS", {
        class: starClass.toString(),
      });
    }

    const color = StarColorValue.create(input.color);
    if (color.toString() !== STAR_CLASS_COLOR[starClass.toString()]) {
      throw ErrorFactory.domain("DOMAIN.INVALID_STAR_COLOR", {
        color: color.toString(),
      });
    }

    return new Star({
      id: Uuid.create(input.id),
      systemId: Uuid.create(input.systemId),
      name: StarName.create(input.name),
      starType,
      starClass,
      surfaceTemperature: input.surfaceTemperature,
      color,
      relativeMass: input.relativeMass,
      absoluteMass: input.absoluteMass,
      relativeRadius: input.relativeRadius,
      absoluteRadius: input.absoluteRadius,
      gravity: input.gravity,
      isMain: input.isMain ?? true,
      orbital: input.orbital,
      orbitalStarter: input.orbitalStarter,
    });
  }

  static rehydrate(props: StarProps): Star {
    return Star.create({ ...props });
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

  get starType() {
    return this.props.starType.toString();
  }

  get starClass() {
    return this.props.starClass.toString();
  }

  get surfaceTemperature(): number {
    return this.props.surfaceTemperature;
  }

  get color() {
    return this.props.color.toString();
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

  get isMain(): boolean {
    return this.props.isMain;
  }

  get orbital(): number {
    return this.props.orbital;
  }

  get orbitalStarter(): number {
    return this.props.orbitalStarter;
  }

  changeMainStatus(value: boolean): void {
    if (value !== this.props.isMain) {
      this.props.isMain = value;
    }
  }

  rename(value: string): void {
    const next = StarName.create(value);
    if (!next.equals(this.props.name)) {
      this.props.name = next;
    }
  }

  changeOrbital(value: number): void {
    ensureNonNegative("orbital", value);
    if (value !== this.props.orbital) {
      this.props.orbital = value;
    }
  }

  changeOrbitalStarter(value: number): void {
    ensureNonNegative("orbitalStarter", value);
    if (value !== this.props.orbitalStarter) {
      this.props.orbitalStarter = value;
    }
  }

  toJSON(): StarProps {
    return {
      id: this.id,
      systemId: this.systemId,
      name: this.name,
      starType: this.starType,
      starClass: this.starClass,
      surfaceTemperature: this.surfaceTemperature,
      color: this.color,
      relativeMass: this.relativeMass,
      absoluteMass: this.absoluteMass,
      relativeRadius: this.relativeRadius,
      absoluteRadius: this.absoluteRadius,
      gravity: this.gravity,
      isMain: this.isMain,
      orbital: this.orbital,
      orbitalStarter: this.orbitalStarter,
    };
  }

  toDB(): StarDTO {
    return {
      id: this.id,
      system_id: this.systemId,
      name: this.name,
      star_type: this.starType,
      star_class: this.starClass,
      surface_temperature: this.surfaceTemperature,
      color: this.color,
      relative_mass: this.relativeMass,
      absolute_mass: this.absoluteMass,
      relative_radius: this.relativeRadius,
      absolute_radius: this.absoluteRadius,
      gravity: this.gravity,
      is_main: this.isMain,
      orbital: this.orbital,
      orbital_starter: this.orbitalStarter,
    };
  }
}
