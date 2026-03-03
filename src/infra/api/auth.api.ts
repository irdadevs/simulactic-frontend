import { z } from "zod";
import { apiGet, apiPatch, apiPost } from "./client";

export const loginRequestSchema = z.object({
  email: z.email(),
  rawPassword: z.string().min(1),
});

export const signupRequestSchema = z.object({
  email: z.email(),
  rawPassword: z.string().min(6),
  username: z.string().min(3).max(25),
});

export const authUserSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    username: z.string().min(1),
    role: z.enum(["User", "Admin"]),
    verified: z.boolean(),
    isDeleted: z.boolean(),
    isArchived: z.boolean(),
    isSupporter: z.boolean(),
    createdAt: z.iso.datetime(),
    lastActivityAt: z.iso.datetime(),
    verifiedAt: z.iso.datetime().nullable(),
    deletedAt: z.iso.datetime().nullable(),
    archivedAt: z.iso.datetime().nullable(),
    supporterFrom: z.iso.datetime().nullable(),
  })
  .strict();

export const authUserEnvelopeSchema = z
  .object({
    user: authUserSchema,
  })
  .strict();

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type SignupRequest = z.infer<typeof signupRequestSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthUserEnvelope = z.infer<typeof authUserEnvelopeSchema>;

export const parseAuthUserEnvelope = (input: unknown): AuthUserEnvelope =>
  authUserEnvelopeSchema.parse(input);

export type RefreshRequest = {
  refreshToken: string;
};

export type LogoutRequest = {
  sessionId: string;
};

export type VerifyRequest = {
  email: string;
  code: string;
};

export type ResendVerificationRequest = {
  email: string;
};

export type ChangeEmailRequest = {
  newEmail: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ChangeUsernameRequest = {
  newUsername: string;
};

const BASE = "/users";

export const authApi = {
  login: (body: LoginRequest): Promise<AuthUserEnvelope> =>
    apiPost(`${BASE}/login`, { body, timeoutMs: 90000 }),

  signup: (body: SignupRequest): Promise<AuthUserEnvelope> =>
    apiPost(`${BASE}/signup`, { body, timeoutMs: 90000 }),

  refresh: (body?: RefreshRequest): Promise<{ ok: true }> =>
    apiPost(`${BASE}/token/refresh`, body ? { body, timeoutMs: 90000 } : { timeoutMs: 90000 }),

  logout: (body?: LogoutRequest): Promise<void> =>
    apiPost(`${BASE}/logout`, body ? { body } : undefined),

  logoutAll: (): Promise<void> => apiPost(`${BASE}/logout/all`),

  me: (view?: "dashboard"): Promise<AuthUserEnvelope> =>
    apiGet(`${BASE}/me`, view ? { query: { view } } : undefined),

  changeEmail: (body: ChangeEmailRequest): Promise<void> => apiPatch(`${BASE}/me/email`, { body }),

  changePassword: (body: ChangePasswordRequest): Promise<void> =>
    apiPatch(`${BASE}/me/password`, { body }),

  changeUsername: (body: ChangeUsernameRequest): Promise<void> =>
    apiPatch(`${BASE}/me/username`, { body }),

  verify: (body: VerifyRequest): Promise<void> => apiPost(`${BASE}/verify`, { body }),

  resendVerification: (body: ResendVerificationRequest): Promise<void> =>
    apiPost(`${BASE}/verify/resend`, { body }),
};
