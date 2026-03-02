import { MoonApiResponse, MoonSize } from "../../types/moon.types";
import { apiGet, apiPatch, ApiListResponse } from "./client";

export type ChangeMoonNameRequest = {
  name: string;
};

export type ChangeMoonSizeRequest = {
  size: MoonSize;
};

export type ChangeMoonOrbitalRequest = {
  orbital: number;
};

const BASE = "/moons";

export const moonApi = {
  listByPlanet: (planetId: string): Promise<ApiListResponse<MoonApiResponse>> =>
    apiGet(`${BASE}/planet/${encodeURIComponent(planetId)}`),

  findById: (id: string): Promise<MoonApiResponse | null> =>
    apiGet(`${BASE}/${encodeURIComponent(id)}`),

  findByName: (name: string): Promise<MoonApiResponse | null> =>
    apiGet(`${BASE}/name/${encodeURIComponent(name)}`),

  changeName: (id: string, body: ChangeMoonNameRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/name`, { body }),

  changeSize: (id: string, body: ChangeMoonSizeRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/size`, { body }),

  changeOrbital: (id: string, body: ChangeMoonOrbitalRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/orbital`, { body }),
};
