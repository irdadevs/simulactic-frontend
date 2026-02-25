export type UserRole = "User" | "Admin";

export type UserProps = {
  id: string;
  email: string;
  role: UserRole;
  verified: boolean;
};

export type UserCreateProps = {
  id?: string;
  email: string;
  role?: UserRole;
  verified?: boolean;
};

export type UserDTO = {
  id: string;
  email: string;
  role: UserRole;
  verified: boolean;
};

export type UserApiResponse = {
  id: string;
  email: string;
  role: UserRole;
  verified: boolean;
};
