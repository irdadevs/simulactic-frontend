export type SystemPosition = {
  x: number;
  y: number;
  z: number;
};

export type SystemProps = {
  id: string;
  galaxyId: string;
  name: string;
  position: SystemPosition;
};

export type SystemCreateProps = {
  id?: string;
  galaxyId: string;
  name: string;
  position: SystemPosition;
};

export type SystemDTO = {
  id: string;
  galaxy_id: string;
  name: string;
  position_x: number;
  position_y: number;
  position_z: number;
};

export type SystemApiResponse = {
  id: string;
  galaxy_id: string;
  name: string;
  position_x: number;
  position_y: number;
  position_z: number;
};
