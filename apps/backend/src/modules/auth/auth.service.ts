import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role, User } from '@prisma/client';
import type { Response } from 'express';
import { PublicUser } from 'src/common/types/types';
import { parseJwtExpirationToDate } from 'src/common/utils/date.utils';
import {
  AuthProvider,
  EmailUserData,
  GoogleUserData,
  UserFactoryProvider,
} from '../user/factories';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userFactoryProvider: UserFactoryProvider,
  ) {}

  async validateUser(email: string, password: string): Promise<PublicUser> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _pw, refreshToken: _rt, refreshTokenExpiresAt: _rte, ...safeUser } = user;
    return safeUser;
  }

  async register(data: RegisterDto) {
    const factory = this.userFactoryProvider.getFactory(AuthProvider.EMAIL);

    const emailData: EmailUserData = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
    };

    const result = await factory.createUserWithValidation(emailData);

    return this.login(result.user);
  }

  async login(user: User | PublicUser): Promise<{
    user: PublicUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const {
      password: _pw,
      refreshToken: _rt,
      refreshTokenExpiresAt: _rte,
      ...safeUser
    } = user as User;

    const tokens = await this.generateTokens(user.id, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: safeUser as PublicUser,
      ...tokens,
    };
  }

  async handleGoogleLogin(profile: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
  }) {
    const factory = this.userFactoryProvider.getFactory(AuthProvider.GOOGLE);

    const googleData: GoogleUserData = {
      googleId: profile.googleId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
    };

    const result = await factory.createUserWithValidation(googleData);

    return this.login(result.user);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken || !user.refreshTokenExpiresAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > user.refreshTokenExpiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user.id, user.role);

    const { password: _p, refreshToken: _rt, refreshTokenExpiresAt: _rte, ...safeUser } = user;
    return {
      user: safeUser as PublicUser,
      accessToken: tokens.accessToken,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExpiresAt: null,
      },
    });

    return { message: 'Logged out successfully' };
  }

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refreshToken');
  }

  private async generateTokens(userId: string, role: Role) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, role },
        {
          expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRATION'),
          secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, role },
        {
          expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRATION'),
          secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const expiresIn = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRATION');
    const expiresAt = parseJwtExpirationToDate(expiresIn);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: hashedToken,
        refreshTokenExpiresAt: expiresAt,
      },
    });
  }
}
