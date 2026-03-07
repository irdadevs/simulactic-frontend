import { ApiError } from "../../infra/api/client";

type ApiErrorBody = {
  ok?: boolean;
  error?: string;
  message?: string;
};

const isObject = (input: unknown): input is Record<string, unknown> =>
  typeof input === "object" && input !== null;

const parseApiErrorBody = (error: unknown): { status?: number; code?: string; message?: string } => {
  if (!(error instanceof ApiError)) {
    if (error instanceof Error) return { message: error.message };
    return {};
  }

  const raw = error.body;
  if (!isObject(raw)) {
    return { status: error.status, message: error.message };
  }

  const body = raw as ApiErrorBody;
  return {
    status: error.status,
    code: typeof body.error === "string" ? body.error : undefined,
    message: typeof body.message === "string" ? body.message : error.message,
  };
};

const isTechnicalMessage = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("api request failed with status") ||
    normalized.includes("network request failed") ||
    normalized.includes("request timeout") ||
    normalized.includes("failed: get ") ||
    normalized.includes("failed: post ") ||
    normalized.includes("failed: patch ") ||
    normalized.includes("failed: put ") ||
    normalized.includes("failed: delete ")
  );
};

const cleanMessage = (message?: string): string | null => {
  if (!message) return null;
  const trimmed = message.trim();
  if (!trimmed) return null;
  if (isTechnicalMessage(trimmed)) return null;
  return trimmed;
};

const knownCodeMessages: Record<string, string> = {
  "AUTH.INVALID_CREDENTIALS": "Invalid credentials. Check your email and password and try again.",
  "USERS.EMAIL_NOT_VERIFIED": "Your account email is not verified. Check your inbox and verify first.",
  "USERS.EMAIL_EXIST_SIGNUP": "This email is already in use. Try logging in or use another email.",
  "USERS.USERNAME_EXIST_SIGNUP": "This username is already in use. Choose a different one.",
  "USERS.EMAIL_EXIST_CHANGE": "That email is already assigned to another account.",
  "USERS.USERNAME_EXIST_CHANGE": "That username is already taken.",
  "AUTH.USER_BANNED": "This account is temporarily suspended. Please contact support if you think this is a mistake.",
  "AUTH.IP_BANNED": "This network is temporarily blocked. Please try again later.",
  FORBIDDEN: "You do not have permission to perform this action.",
  UNAUTHORIZED: "Your session is no longer valid. Please log in again.",
  INVALID_TOKEN: "Your session token is invalid or expired. Please log in again.",
  NOT_FOUND: "The requested resource was not found.",
};

export const describeApiError = (error: unknown, fallback: string): string => {
  const parsed = parseApiErrorBody(error);
  const safeMessage = cleanMessage(parsed.message);

  if (parsed.code && knownCodeMessages[parsed.code]) {
    return knownCodeMessages[parsed.code];
  }

  if (error instanceof Error && error.message.toLowerCase().includes("timeout")) {
    return "The request took too long and timed out. Please try again.";
  }

  if (error instanceof Error && error.message.toLowerCase().includes("network request failed")) {
    return "Network connection failed. Check your internet connection and try again.";
  }

  if (parsed.status === 400) return safeMessage ?? "Some input values are invalid. Please review and try again.";
  if (parsed.status === 401) return "Authentication required. Please log in and try again.";
  if (parsed.status === 403) return "You are not allowed to do this action.";
  if (parsed.status === 404) return "Requested data was not found.";
  if (parsed.status === 409) return safeMessage ?? "Conflict detected with existing data.";
  if (parsed.status === 422) return safeMessage ?? "Some fields are invalid. Please review the form.";
  if (parsed.status === 429) return "Too many attempts. Please wait a moment and retry.";
  if (parsed.status && parsed.status >= 500) {
    return "Internal Server Error";
  }

  return safeMessage ?? fallback;
};
