import { SystemApiResponse, SystemPosition } from "../../types/system.types";
import { apiGet, apiPatch, ApiListResponse } from "./client";

export type ChangeSystemNameRequest = {
  name: string;
};

export type ChangeSystemPositionRequest = SystemPosition;
export type ListSystemsByGalaxyQuery = {
  limit?: number;
  offset?: number;
};

const BASE = "/systems";

export const systemApi = {
  listByGalaxy: (
    galaxyId: string,
    query?: ListSystemsByGalaxyQuery,
  ): Promise<ApiListResponse<SystemApiResponse>> =>
    apiGet(`${BASE}/galaxy/${encodeURIComponent(galaxyId)}`, { query }),

  findById: (id: string): Promise<SystemApiResponse | null> =>
    apiGet(`${BASE}/${encodeURIComponent(id)}`),

  findByName: (name: string): Promise<SystemApiResponse | null> =>
    apiGet(`${BASE}/name/${encodeURIComponent(name)}`),

  findByPosition: (position: SystemPosition): Promise<SystemApiResponse | null> =>
    apiGet(`${BASE}/position`, { query: position }),

  changeName: (id: string, body: ChangeSystemNameRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/name`, { body }),

  changePosition: (id: string, body: ChangeSystemPositionRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/position`, { body }),
};
