import { Role, User } from '@prisma/client';
import type { Request } from 'express';

export interface AuthRequest extends Request {
  user: PublicUser;
}

export interface GoogleAuthRequest extends Request {
  user: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface JwtAuthRequest extends Request {
  user: {
    userId: string;
    role: Role;
  };
}

export type PublicUser = Omit<User, 'password' | 'refreshToken' | 'refreshTokenExpiresAt'>;

export type JwtPayload = {
  sub: string;
  role: Role;
};
