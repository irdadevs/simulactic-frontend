import { useCallback } from "react";
import { useAuthStore } from "../../state/auth.store";
import {
  AuthUser,
  authApi,
  ChangeEmailRequest,
  ChangePasswordRequest,
  ChangeUsernameRequest,
  LoginRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
  SignupRequest,
  VerifyRequest,
} from "../../infra/api/auth.api";
import { mapUserApiToDomain, mapUserDomainToView } from "../../domain/user/mappers";
import { UserProps } from "../../types/user.types";

const toMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuthenticatedUser = useAuthStore(
    (state) => state.setAuthenticatedUser,
  );
  const clearSession = useAuthStore((state) => state.clearSession);

  const signInWithUser = useCallback((nextUser: AuthUser): void => {
    const mapped = mapUserDomainToView(mapUserApiToDomain(nextUser));
    setAuthenticatedUser(mapped);
  }, [setAuthenticatedUser]);

  const login = useCallback(async (body: LoginRequest): Promise<UserProps> => {
    const response = await authApi.login(body);
    const mapped = mapUserDomainToView(mapUserApiToDomain(response.user));
    setAuthenticatedUser(mapped);
    return mapped;
  }, [setAuthenticatedUser]);

  const signup = useCallback(async (body: SignupRequest): Promise<UserProps> => {
    const response = await authApi.signup(body);
    const mapped = mapUserDomainToView(mapUserApiToDomain(response.user));
    setAuthenticatedUser(mapped);
    return mapped;
  }, [setAuthenticatedUser]);

  const loadMe = useCallback(async (): Promise<void> => {
    const response = await authApi.me();
    const mapped = mapUserDomainToView(mapUserApiToDomain(response.user));
    setAuthenticatedUser(mapped);
  }, [setAuthenticatedUser]);

  const refresh = useCallback(async (): Promise<void> => {
    await authApi.refresh();
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authApi.logout();
    clearSession();
  }, [clearSession]);

  const logoutAll = useCallback(async (): Promise<void> => {
    await authApi.logoutAll();
    clearSession();
  }, [clearSession]);

  const changeEmail = useCallback(async (body: ChangeEmailRequest): Promise<void> => {
    await authApi.changeEmail(body);
  }, []);

  const changePassword = useCallback(async (body: ChangePasswordRequest): Promise<void> => {
    await authApi.changePassword(body);
  }, []);

  const changeUsername = useCallback(async (body: ChangeUsernameRequest): Promise<void> => {
    await authApi.changeUsername(body);
  }, []);

  const verify = useCallback(async (body: VerifyRequest): Promise<void> => {
    await authApi.verify(body);
  }, []);

  const resendVerification = useCallback(async (body: ResendVerificationRequest): Promise<void> => {
    await authApi.resendVerification(body);
  }, []);

  const resetPassword = useCallback(async (body: ResetPasswordRequest): Promise<void> => {
    await authApi.resetPassword(body);
  }, []);

  return {
    user,
    isAuthenticated,
    signInWithUser,
    login,
    signup,
    loadMe,
    refresh,
    logout,
    logoutAll,
    changeEmail,
    changePassword,
    changeUsername,
    verify,
    resendVerification,
    resetPassword,
    clearSession,
    toErrorMessage: toMessage,
  };
};
