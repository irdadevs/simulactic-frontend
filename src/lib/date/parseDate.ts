import { ErrorFactory } from "../errors/Error.map";

export const parseDateOrThrow = (
  value: string | Date,
  fieldName: string,
): Date => {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw ErrorFactory.domain("DOMAIN.INVALID_DATE", {
      field: fieldName,
      value,
    });
  }
  return parsed;
};
