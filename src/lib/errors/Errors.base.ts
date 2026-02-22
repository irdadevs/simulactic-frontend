export type ErrorMeta = Record<string, unknown>;

export class BaseError extends Error {
  constructor(
    public readonly code: string,
    message?: string,
    public readonly meta?: ErrorMeta,
    public readonly cause?: unknown,
    public readonly isPublic?: boolean,
    public readonly retryable?: boolean,
    public readonly layer?: string,
  ) {
    super(message ?? code);
    this.name = this.constructor.name;
  }
}

export class DomainError extends BaseError {}
export class ApplicationError extends BaseError {}
export class InfrastructureError extends BaseError {}
export class PresentationError extends BaseError {}
