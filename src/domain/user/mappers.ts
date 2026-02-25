import { User } from "./User.aggregate";
import { UserApiResponse, UserDTO, UserProps } from "../../types/user.types";

export const mapUserApiToDomain = (input: UserApiResponse): User =>
  User.rehydrate({
    id: input.id,
    email: input.email,
    role: input.role,
    verified: input.verified,
  });

export const mapUserDomainToDTO = (user: User): UserDTO => user.toDB();

export const mapUserDomainToView = (user: User): UserProps => user.toJSON();

