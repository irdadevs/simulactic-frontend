import { PlanetApiResponse, PlanetBiome } from "../../types/planet.types";
import { apiGet, apiPatch, ApiListResponse } from "./client";

export type ChangePlanetNameRequest = {
  name: string;
};

export type ChangePlanetOrbitalRequest = {
  orbital: number;
};

export type ChangePlanetBiomeRequest = {
  biome: PlanetBiome;
};

const BASE = "/planets";

export const planetApi = {
  listBySystem: (systemId: string): Promise<ApiListResponse<PlanetApiResponse>> =>
    apiGet(`${BASE}/system/${encodeURIComponent(systemId)}`),

  findById: (id: string): Promise<PlanetApiResponse | null> =>
    apiGet(`${BASE}/${encodeURIComponent(id)}`),

  findByName: (name: string): Promise<PlanetApiResponse | null> =>
    apiGet(`${BASE}/name/${encodeURIComponent(name)}`),

  changeName: (id: string, body: ChangePlanetNameRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/name`, { body }),

  changeOrbital: (id: string, body: ChangePlanetOrbitalRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/orbital`, { body }),

  changeBiome: (id: string, body: ChangePlanetBiomeRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/biome`, { body }),
};
