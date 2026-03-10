import { UserApiResponse, UserRole } from "../../types/user.types";
import { apiDelete, apiGet, apiPatch, apiPost, ApiListResponse } from "./client";

export type AdminUserListItemApiResponse = Omit<UserApiResponse, "verified"> & {
  isVerified: boolean;
};

export type AdminUserDetailApiResponse = AdminUserListItemApiResponse & {
  verificationCodeActive: boolean;
  verificationCodeExpiresAt: string | null;
};

export type UserEnvelope = {
  user: UserApiResponse | AdminUserDetailApiResponse;
};

export type ListUsersQuery = {
  includeDeleted?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: "createdAt" | "username" | "email";
  orderDir?: "asc" | "desc";
  view?: "dashboard";
};

export type ListUsersResponse = ApiListResponse<UserApiResponse | AdminUserListItemApiResponse>;

export type ChangeRoleRequest = {
  newRole: UserRole;
};

export type SoftDeleteRequest = {
  id: string;
};

export type RestoreRequest = {
  id: string;
};

export type BanUserRequest = {
  reason: string;
  expiresAt?: string | Date;
};

export type BanIpRequest = {
  ipAddress: string;
  reason: string;
  expiresAt?: string | Date;
};

export type UnbanIpRequest = {
  ipAddress: string;
};

export type BanResponse = {
  id: string;
  reason: string;
  source: string;
  bannedBy: string | null;
  createdAt: string;
  expiresAt: string | null;
  userId?: string;
  ipAddress?: string;
};

export type SupporterBadgeBranchProgress = {
  level: number;
  maxLevel: number;
  nextLevel: number | null;
  nextThreshold: number | null;
  currentBadge: SupporterBadgeLevelResponse | null;
  nextBadge: SupporterBadgeLevelResponse | null;
};

export type SupporterBadgeLevelResponse = {
  level: number;
  branch: "amount" | "months";
  name: string;
  quantityLabel: string;
  threshold: number;
};

export type SupporterUnlockedBadgeResponse = SupporterBadgeLevelResponse & {
  unlockedAt: string;
};

export type SupporterProgressResponse = {
  totalDonatedEurMinor: number;
  monthlySupportingMonths: number;
  unlockedBadges: SupporterUnlockedBadgeResponse[];
  amountBranch: SupporterBadgeBranchProgress;
  monthlyBranch: SupporterBadgeBranchProgress;
  updatedAt: string | null;
};

export type ActiveBansResponse = {
  users: Array<{
    id: string;
    userId: string;
    reason: string;
    source: string;
    bannedBy: string | null;
    createdAt: string;
    expiresAt: string | null;
  }>;
  ips: Array<{
    id: string;
    ipAddress: string;
    reason: string;
    source: string;
    bannedBy: string | null;
    createdAt: string;
    expiresAt: string | null;
  }>;
};

const BASE = "/users";

export const userApi = {
  health: (): Promise<{ service: string; status: "ok" }> => apiGet(`${BASE}/health`),

  list: (query?: ListUsersQuery): Promise<ListUsersResponse> => apiGet(`${BASE}`, { query }),

  me: (view?: "dashboard"): Promise<UserEnvelope> =>
    apiGet(`${BASE}/me`, view ? { query: { view } } : undefined),

  findById: (id: string, view?: "dashboard"): Promise<UserEnvelope> =>
    apiGet(`${BASE}/${encodeURIComponent(id)}`, view ? { query: { view } } : undefined),

  findByEmail: (email: string, view?: "dashboard"): Promise<UserEnvelope> =>
    apiGet(`${BASE}/email/${encodeURIComponent(email)}`, view ? { query: { view } } : undefined),

  findByUsername: (username: string, view?: "dashboard"): Promise<UserEnvelope> =>
    apiGet(
      `${BASE}/username/${encodeURIComponent(username)}`,
      view ? { query: { view } } : undefined,
    ),

  changeRole: (id: string, body: ChangeRoleRequest): Promise<void> =>
    apiPatch(`${BASE}/${encodeURIComponent(id)}/role`, { body }),

  selfSoftDelete: (): Promise<void> => apiDelete(`${BASE}/me`),

  softDelete: (body: SoftDeleteRequest): Promise<void> => apiDelete(`${BASE}/soft-delete`, { body }),

  restore: (body: RestoreRequest): Promise<void> => apiPost(`${BASE}/restore`, { body }),

  banUser: (id: string, body: BanUserRequest): Promise<BanResponse> =>
    apiPost(`${BASE}/${encodeURIComponent(id)}/ban`, { body }),

  unbanUser: (id: string): Promise<void> => apiPost(`${BASE}/${encodeURIComponent(id)}/unban`),

  listActiveBans: (limit?: number): Promise<ActiveBansResponse> =>
    apiGet(`${BASE}/bans`, limit ? { query: { limit } } : undefined),

  banIp: (body: BanIpRequest): Promise<BanResponse> => apiPost(`${BASE}/bans/ip`, { body }),

  unbanIp: (body: UnbanIpRequest): Promise<void> => apiPost(`${BASE}/bans/ip/unban`, { body }),

  mySupporterProgress: (): Promise<SupporterProgressResponse> =>
    apiGet(`${BASE}/me/supporter-progress`),
};
