import { StarApiResponse } from "../../types/star.types";
import { apiGet, apiPatch, ApiListResponse } from "./client";

export type ChangeStarNameRequest = {
  name: string;
};

export type ChangeStarMainRequest = {
  isMain: boolean;
};

export type ChangeStarOrbitalRequest = {
  orbital: number;
};

export type ChangeStarStarterOrbitalRequest = {
  orbitalStarter: number;
};

const BASE = "/stars";

export const starApi = {
  listBySystem: (systemId: string): Promise<ApiListResponse<StarApiResponse>> =>
    apiGet(`${BASE}/system/${encodeURIComponent(systemId)}`),

  findById: (id: string): Promise<StarApiResponse | null> =>
    apiGet(`${BASE}/${encodeURIComponent(id)}`),

  findByName: (name: string): Promise<StarApiResponse | null> =>
    apiGet(`${BASE}/name/${encodeURIComponent(name)}`),

  changeName: (id: string, body: ChangeStarNameRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/name`, { body }),

  changeMain: (id: string, body: ChangeStarMainRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/main`, { body }),

  changeOrbital: (id: string, body: ChangeStarOrbitalRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/orbital`, { body }),

  changeStarterOrbital: (id: string, body: ChangeStarStarterOrbitalRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/orbital-starter`, { body }),
};
