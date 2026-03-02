import {
  AsteroidApiResponse,
  AsteroidSize,
  AsteroidType,
} from "../../types/asteroid.types";
import { apiGet, apiPatch, ApiListResponse } from "./client";

export type ChangeAsteroidNameRequest = {
  name: string;
};

export type ChangeAsteroidTypeRequest = {
  type: AsteroidType;
};

export type ChangeAsteroidSizeRequest = {
  size: AsteroidSize;
};

export type ChangeAsteroidOrbitalRequest = {
  orbital: number;
};

const BASE = "/asteroids";

export const asteroidApi = {
  listBySystem: (systemId: string): Promise<ApiListResponse<AsteroidApiResponse>> =>
    apiGet(`${BASE}/system/${encodeURIComponent(systemId)}`),

  findById: (id: string): Promise<AsteroidApiResponse | null> =>
    apiGet(`${BASE}/${encodeURIComponent(id)}`),

  findByName: (name: string): Promise<AsteroidApiResponse | null> =>
    apiGet(`${BASE}/name/${encodeURIComponent(name)}`),

  changeName: (id: string, body: ChangeAsteroidNameRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/name`, { body }),

  changeType: (id: string, body: ChangeAsteroidTypeRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/type`, { body }),

  changeSize: (id: string, body: ChangeAsteroidSizeRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/size`, { body }),

  changeOrbital: (id: string, body: ChangeAsteroidOrbitalRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/orbital`, { body }),
};
