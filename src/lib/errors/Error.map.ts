import { createErrorFactory, ErrorDef } from "./Errors.factory";

export const ErrorMap = {
  INVALID_USER_ID: {
    code: "DOMAIN.INVALID_USER_ID",
    public: true,
  },
  INVALID_USER_EMAIL: {
    code: "DOMAIN.INVALID_USER_EMAIL",
    public: true,
  },
  INVALID_USER_PASSWORD: {
    code: "DOMAIN.INVALID_USER_PASSWORD",
    public: true,
  },
  INVALID_USER_USERNAME: {
    code: "DOMAIN.INVALID_USER_USERNAME",
    public: true,
  },
  INVALID_USER_ROLE: {
    code: "DOMAIN.INVALID_USER_ROLE",
    public: true,
  },
  INVALID_GALAXY_NAME: {
    code: "DOMAIN.INVALID_GALAXY_NAME",
    public: true,
  },
  INVALID_GALAXY_SHAPE: {
    code: "DOMAIN.INVALID_GALAXY_SHAPE",
    public: true,
  },
  INVALID_SYSTEM_NAME: {
    code: "DOMAIN.INVALID_SYSTEM_NAME",
    public: true,
  },
  INVALID_SYSTEM_POSITION: {
    code: "DOMAIN.INVALID_SYSTEM_POSITION",
    public: true,
  },
  INVALID_STAR_TYPE: {
    code: "DOMAIN.INVALID_STAR_TYPE",
    public: true,
  },
  INVALID_STAR_CLASS: {
    code: "DOMAIN.INVALID_STAR_CLASS",
    public: true,
  },
  INVALID_STAR_COLOR: {
    code: "DOMAIN.INVALID_STAR_COLOR",
    public: true,
  },
  INVALID_STAR_VALUE: {
    code: "DOMAIN.INVALID_STAR_VALUE",
    public: true,
  },
  INVALID_PLANET_NAME: {
    code: "DOMAIN.INVALID_PLANET_NAME",
    public: true,
  },
  INVALID_PLANET_TYPE: {
    code: "DOMAIN.INVALID_PLANET_TYPE",
    public: true,
  },
  INVALID_PLANET_SIZE: {
    code: "DOMAIN.INVALID_PLANET_SIZE",
    public: true,
  },
  INVALID_PLANET_BIOME: {
    code: "DOMAIN.INVALID_PLANET_BIOME",
    public: true,
  },
  INVALID_PLANET_VALUE: {
    code: "DOMAIN.INVALID_PLANET_VALUE",
    public: true,
  },
  INVALID_MOON_NAME: {
    code: "DOMAIN.INVALID_MOON_NAME",
    public: true,
  },
  INVALID_MOON_SIZE: {
    code: "DOMAIN.INVALID_MOON_SIZE",
    public: true,
  },
  INVALID_MOON_VALUE: {
    code: "DOMAIN.INVALID_MOON_VALUE",
    public: true,
  },
  INVALID_MOON_ORBITAL: {
    code: "DOMAIN.INVALID_MOON_ORBITAL",
    public: true,
  },
  INVALID_ASTEROID_NAME: {
    code: "DOMAIN.INVALID_ASTEROID_NAME",
    public: true,
  },
  INVALID_ASTEROID_TYPE: {
    code: "DOMAIN.INVALID_ASTEROID_TYPE",
    public: true,
  },
  INVALID_ASTEROID_SIZE: {
    code: "DOMAIN.INVALID_ASTEROID_SIZE",
    public: true,
  },
  INVALID_ASTEROID_ORBITAL: {
    code: "DOMAIN.INVALID_ASTEROID_ORBITAL",
    public: true,
  },
  USER_RESTORE_FAILED: {
    code: "USERS.RESTORE_FAILED",
    public: true,
  },
  INVALID_FIELD: {
    code: "PRESENTATION.INVALID_FIELD",
    public: true,
  },
  INVALID_DATE: {
    code: "DOMAIN.INVALID_DATE",
    public: true,
  },
} as const satisfies Record<string, ErrorDef>;

export type SharedError = (typeof ErrorMap)[keyof typeof ErrorMap];
export type ErrorCode = SharedError["code"];

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorMap.INVALID_USER_ID.code]: "Invalid user UUID. Id: ${id}.",
  [ErrorMap.INVALID_USER_EMAIL.code]: "Invalid user email. Email: ${email}.",
  [ErrorMap.INVALID_USER_PASSWORD.code]: "Invalid user password.",
  [ErrorMap.INVALID_USER_USERNAME.code]: "Invalid username. Username: ${username}.",
  [ErrorMap.INVALID_USER_ROLE.code]: "Invalid user role. Role: ${role}.",
  [ErrorMap.INVALID_GALAXY_NAME.code]: "Invalid galaxy name. Name: ${name}.",
  [ErrorMap.INVALID_GALAXY_SHAPE.code]: "Invalid galaxy shape. Shape: ${shape}.",
  [ErrorMap.INVALID_SYSTEM_NAME.code]: "Invalid system name. Name: ${name}.",
  [ErrorMap.INVALID_SYSTEM_POSITION.code]: "Invalid system position. Position: ${position}.",
  [ErrorMap.INVALID_STAR_TYPE.code]: "Invalid star type. Type: ${type}.",
  [ErrorMap.INVALID_STAR_CLASS.code]: "Invalid star class. Class: ${class}.",
  [ErrorMap.INVALID_STAR_COLOR.code]: "Invalid star color. Color: ${color}.",
  [ErrorMap.INVALID_STAR_VALUE.code]: "Invalid star value. Field: ${field}.",
  [ErrorMap.INVALID_PLANET_NAME.code]: "Invalid planet name. Name: ${name}.",
  [ErrorMap.INVALID_PLANET_TYPE.code]: "Invalid planet type. Type: ${type}.",
  [ErrorMap.INVALID_PLANET_SIZE.code]: "Invalid planet size. Size: ${size}.",
  [ErrorMap.INVALID_PLANET_BIOME.code]: "Invalid planet biome. Biome: ${biome}.",
  [ErrorMap.INVALID_PLANET_VALUE.code]: "Invalid planet value. Field: ${field}.",
  [ErrorMap.INVALID_MOON_NAME.code]: "Invalid moon name. Name: ${name}.",
  [ErrorMap.INVALID_MOON_SIZE.code]: "Invalid moon size. Size: ${size}.",
  [ErrorMap.INVALID_MOON_VALUE.code]: "Invalid moon value. Field: ${field}.",
  [ErrorMap.INVALID_MOON_ORBITAL.code]: "Invalid moon orbital. Orbital: ${orbital}.",
  [ErrorMap.INVALID_ASTEROID_NAME.code]: "Invalid asteroid name. Name: ${name}.",
  [ErrorMap.INVALID_ASTEROID_TYPE.code]: "Invalid asteroid type. Type: ${type}.",
  [ErrorMap.INVALID_ASTEROID_SIZE.code]: "Invalid asteroid size. Size: ${size}.",
  [ErrorMap.INVALID_ASTEROID_ORBITAL.code]:
    "Invalid asteroid orbital. Orbital: ${orbital}.",
  [ErrorMap.USER_RESTORE_FAILED.code]: "User restore failed. Cause: ${cause}.",
  [ErrorMap.INVALID_FIELD.code]: "Invalid field. Field: ${field}.",
  [ErrorMap.INVALID_DATE.code]:
    "Invalid date value for field ${field}. Value: ${value}.",
};

export const ErrorFactory = createErrorFactory(ErrorMap, ErrorMessages);
