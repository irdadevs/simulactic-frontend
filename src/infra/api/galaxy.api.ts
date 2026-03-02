import { AsteroidApiResponse } from "../../types/asteroid.types";
import { GalaxyApiResponse, GalaxyShapeValue } from "../../types/galaxy.types";
import { MoonApiResponse } from "../../types/moon.types";
import { PlanetApiResponse } from "../../types/planet.types";
import { StarApiResponse } from "../../types/star.types";
import { SystemApiResponse } from "../../types/system.types";
import { apiDelete, apiGet, apiPatch, apiPost, ApiListResponse } from "./client";

export type CreateGalaxyRequest = {
  name: string;
  shape?: GalaxyShapeValue;
  systemCount: number;
};

export type ChangeGalaxyNameRequest = {
  name: string;
};

export type ChangeGalaxyShapeRequest = {
  shape: GalaxyShapeValue;
};

export type ListGalaxiesQuery = {
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: "createdAt" | "name" | "shape" | "owner";
  orderDir?: "asc" | "desc";
};

export type GalaxyPopulateResponse = {
  galaxy: GalaxyApiResponse;
  systems: Array<{
    system: SystemApiResponse;
    stars: StarApiResponse[];
    planets: Array<{
      planet: PlanetApiResponse;
      moons: MoonApiResponse[];
    }>;
    asteroids: AsteroidApiResponse[];
  }>;
};

const BASE = "/galaxies";

export const galaxyApi = {
  create: (body: CreateGalaxyRequest): Promise<GalaxyApiResponse> =>
    apiPost(`${BASE}`, { body }),

  list: (query?: ListGalaxiesQuery): Promise<ApiListResponse<GalaxyApiResponse>> =>
    apiGet(`${BASE}`, { query }),

  findById: (id: string): Promise<GalaxyApiResponse | null> =>
    apiGet(`${BASE}/${encodeURIComponent(id)}`),

  findByOwner: (ownerId: string): Promise<GalaxyApiResponse | null> =>
    apiGet(`${BASE}/owner/${encodeURIComponent(ownerId)}`),

  findByName: (name: string): Promise<GalaxyApiResponse | null> =>
    apiGet(`${BASE}/name/${encodeURIComponent(name)}`),

  populate: (id: string): Promise<GalaxyPopulateResponse> =>
    apiGet(`${BASE}/${encodeURIComponent(id)}/populate`),

  changeName: (id: string, body: ChangeGalaxyNameRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/name`, { body }),

  changeShape: (id: string, body: ChangeGalaxyShapeRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/shape`, { body }),

  remove: (id: string): Promise<void> => apiDelete(`${BASE}/${encodeURIComponent(id)}`),
};
