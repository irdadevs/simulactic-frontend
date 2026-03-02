import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const signupRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
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
