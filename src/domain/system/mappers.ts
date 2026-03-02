import { System } from "./System.aggregate";
import { SystemApiResponse, SystemDTO, SystemProps } from "../../types/system.types";

export const mapSystemApiToDomain = (input: SystemApiResponse): System =>
  System.rehydrate({
    id: input.id,
    galaxyId: input.galaxyId,
    name: input.name,
    position: input.position,
  });

export const mapSystemDomainToDTO = (system: System): SystemDTO => system.toDB();

export const mapSystemDomainToView = (system: System): SystemProps => system.toJSON();

