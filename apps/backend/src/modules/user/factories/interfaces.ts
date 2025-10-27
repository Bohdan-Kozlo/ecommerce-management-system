import { User } from '@prisma/client';

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
}

export interface BaseUserData {
  email: string;
  firstName: string;
  lastName: string;
}

export interface EmailUserData extends BaseUserData {
  password: string;
}

export interface GoogleUserData extends BaseUserData {
  googleId: string;
}

export interface UserCreationResult {
  user: User;
  isNewUser: boolean;
  provider: AuthProvider;
}

export interface IUserFactory {
  createUserWithValidation(data: BaseUserData): Promise<UserCreationResult>;

  createUser(data: BaseUserData): Promise<UserCreationResult>;

  validateUserData(data: BaseUserData): void;

  getProviderType(): AuthProvider;
}
