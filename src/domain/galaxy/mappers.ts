import { parseDateOrThrow } from "../../lib/date/parseDate";
import { Galaxy } from "./Galaxy.aggregate";
import { GalaxyApiResponse, GalaxyDTO, GalaxyProps } from "../../types/galaxy.types";

export const mapGalaxyApiToDomain = (input: GalaxyApiResponse): Galaxy =>
  Galaxy.rehydrate({
    id: input.id,
    ownerId: input.owner_id,
    name: input.name,
    shape: input.shape as GalaxyProps["shape"],
    systemCount: input.system_count,
    createdAt: parseDateOrThrow(input.created_at, "created_at"),
  });

export const mapGalaxyDomainToDTO = (galaxy: Galaxy): GalaxyDTO => galaxy.toDB();

export const mapGalaxyDomainToView = (galaxy: Galaxy): GalaxyProps => galaxy.toJSON();

