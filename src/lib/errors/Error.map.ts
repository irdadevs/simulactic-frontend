import { createErrorFactory, ErrorDef } from "./Errors.factory";

export const ErrorMap = {
  INVALID_USER_ID: {
    code: "DOMAIN.INVALID_USER_ID",
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
  INVALID_DATE: {
    code: "DOMAIN.INVALID_DATE",
    public: true,
  },
} as const satisfies Record<string, ErrorDef>;

export type SharedError = (typeof ErrorMap)[keyof typeof ErrorMap];
export type ErrorCode = SharedError["code"];

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorMap.INVALID_USER_ID.code]: "Invalid user UUID. Id: ${id}.",
  [ErrorMap.INVALID_GALAXY_NAME.code]: "Invalid galaxy name. Name: ${name}.",
  [ErrorMap.INVALID_GALAXY_SHAPE.code]:
    "Invalid galaxy shape. Shape: ${shape}.",
  [ErrorMap.INVALID_DATE.code]:
    "Invalid date value for field ${field}. Value: ${value}.",
};

export const ErrorFactory = createErrorFactory(ErrorMap, ErrorMessages);
