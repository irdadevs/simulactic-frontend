import { System } from "./System.aggregate";
import { SystemApiResponse, SystemDTO, SystemProps } from "../../types/system.types";

export const mapSystemApiToDomain = (input: SystemApiResponse): System =>
  System.rehydrate({
    id: input.id,
    galaxyId: input.galaxy_id,
    name: input.name,
    position: {
      x: input.position_x,
      y: input.position_y,
      z: input.position_z,
    },
  });

export const mapSystemDomainToDTO = (system: System): SystemDTO => system.toDB();

export const mapSystemDomainToView = (system: System): SystemProps => system.toJSON();

