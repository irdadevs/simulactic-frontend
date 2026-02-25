export type AsteroidType = "single" | "cluster";

export type AsteroidSize = "small" | "medium" | "big" | "massive";

export type AsteroidProps = {
  id: string;
  systemId: string;
  name: string;
  type: AsteroidType;
  size: AsteroidSize;
  orbital: number;
};

export type AsteroidCreateProps = {
  id?: string;
  systemId: string;
  name: string;
  type: AsteroidType;
  size: AsteroidSize;
  orbital: number;
};

export type AsteroidDTO = {
  id: string;
  system_id: string;
  name: string;
  type: AsteroidType;
  size: AsteroidSize;
  orbital: number;
};

export type AsteroidApiResponse = {
  id: string;
  system_id: string;
  name: string;
  type: AsteroidType;
  size: AsteroidSize;
  orbital: number;
};
