import { useAuthStore } from "../../state/auth.store";
import {
  AuthUser,
  authApi,
  ChangeEmailRequest,
  ChangePasswordRequest,
  ChangeUsernameRequest,
  LoginRequest,
  ResendVerificationRequest,
  SignupRequest,
  VerifyRequest,
} from "../../infra/api/auth.api";
import { mapUserApiToDomain, mapUserDomainToView } from "../../domain/user/mappers";

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

  const signInWithUser = (nextUser: AuthUser): void => {
    const mapped = mapUserDomainToView(mapUserApiToDomain(nextUser));
    setAuthenticatedUser(mapped);
  };

  const login = async (body: LoginRequest): Promise<void> => {
    const response = await authApi.login(body);
    const mapped = mapUserDomainToView(mapUserApiToDomain(response.user));
    setAuthenticatedUser(mapped);
  };

  const signup = async (body: SignupRequest): Promise<void> => {
    const response = await authApi.signup(body);
    const mapped = mapUserDomainToView(mapUserApiToDomain(response.user));
    setAuthenticatedUser(mapped);
  };

  const loadMe = async (): Promise<void> => {
    const response = await authApi.me();
    const mapped = mapUserDomainToView(mapUserApiToDomain(response.user));
    setAuthenticatedUser(mapped);
  };

  const refresh = async (): Promise<void> => {
    await authApi.refresh();
  };

  const logout = async (): Promise<void> => {
    await authApi.logout();
    clearSession();
  };

  const logoutAll = async (): Promise<void> => {
    await authApi.logoutAll();
    clearSession();
  };

  const changeEmail = async (body: ChangeEmailRequest): Promise<void> => {
    await authApi.changeEmail(body);
  };

  const changePassword = async (body: ChangePasswordRequest): Promise<void> => {
    await authApi.changePassword(body);
  };

  const changeUsername = async (body: ChangeUsernameRequest): Promise<void> => {
    await authApi.changeUsername(body);
  };

  const verify = async (body: VerifyRequest): Promise<void> => {
    await authApi.verify(body);
  };

  const resendVerification = async (body: ResendVerificationRequest): Promise<void> => {
    await authApi.resendVerification(body);
  };

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
    clearSession,
    toErrorMessage: toMessage,
  };
};
