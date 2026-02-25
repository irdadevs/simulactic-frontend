export type GalaxyShapeValue =
  | "spherical"
  | "3-arm spiral"
  | "5-arm spiral"
  | "irregular";

export type GalaxyProps = {
  id: string;
  ownerId: string;
  name: string;
  shape: GalaxyShapeValue;
  systemCount: number;
  createdAt: Date;
};

export type GalaxyCreateProps = {
  id?: string;
  ownerId: string;
  name: string;
  shape?: string;
  systemCount: number;
  createdAt?: Date;
};

export type GalaxyDTO = {
  id: string;
  owner_id: string;
  name: string;
  shape: GalaxyShapeValue;
  system_count: number;
  created_at: Date;
};

export type GalaxyApiResponse = {
  id: string;
  owner_id: string;
  name: string;
  shape: string;
  system_count: number;
  created_at: string | Date;
};
