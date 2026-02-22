import {
  ApplicationError,
  DomainError,
  InfrastructureError,
  PresentationError,
} from "./Errors.base";

export type ErrorDef = {
  code: string;
  public: boolean;
};

export type ErrorMap = Record<string, ErrorDef>;

export type ErrorCode<M extends ErrorMap> = M[keyof M] extends {
  code: infer C extends string;
}
  ? C
  : never;

const formatMessage = (tpl: string, meta?: Record<string, unknown>): string => {
  if (!tpl || !meta) return tpl;
  return tpl.replace(/\$\{(\w+)\}/g, (_: string, key: string) =>
    String(meta[key] ?? ""),
  );
};

export function createErrorFactory<M extends ErrorMap>(
  map: M,
  messages: Record<ErrorCode<M>, string>,
) {
  const defs = Object.values(map) as Array<M[keyof M] & ErrorDef>;

  const resolve = (code: ErrorCode<M>) => {
    const def = defs.find((item) => item.code === code);
    if (!def) {
      throw new DomainError(
        "DOMAIN.UNKNOWN_ERROR_CODE",
        `Unknown error code: ${code}`,
        { code },
      );
    }
    return { def, messageTpl: messages[code] ?? code };
  };

  return {
    domain(
      code: ErrorCode<M>,
      meta?: Record<string, unknown>,
      cause?: unknown,
    ) {
      const { def, messageTpl } = resolve(code);
      return new DomainError(
        def.code,
        formatMessage(messageTpl, meta),
        meta,
        cause,
        def.public,
        undefined,
        "Domain Layer",
      );
    },
    app(code: ErrorCode<M>, meta?: Record<string, unknown>, cause?: unknown) {
      const { def, messageTpl } = resolve(code);
      return new ApplicationError(
        def.code,
        formatMessage(messageTpl, meta),
        meta,
        cause,
        def.public,
        undefined,
        "Application Layer",
      );
    },
    infra(code: ErrorCode<M>, meta?: Record<string, unknown>, cause?: unknown) {
      const { def, messageTpl } = resolve(code);
      return new InfrastructureError(
        def.code,
        formatMessage(messageTpl, meta),
        meta,
        cause,
        def.public,
        undefined,
        "Infrastructure Layer",
      );
    },
    presentation(
      code: ErrorCode<M>,
      meta?: Record<string, unknown>,
      cause?: unknown,
    ) {
      const { def, messageTpl } = resolve(code);
      return new PresentationError(
        def.code,
        formatMessage(messageTpl, meta),
        meta,
        cause,
        def.public,
        undefined,
        "Presentation Layer",
      );
    },
  };
}
