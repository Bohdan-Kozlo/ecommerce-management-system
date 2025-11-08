import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import type { Response } from 'express';

@Injectable()
export class JwtTokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  setAccessTokenCookie(res: Response, accessToken: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000,
    });
  }

  clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refreshToken');
  }

  clearAccessTokenCookie(res: Response) {
    res.clearCookie('accessToken');
  }

  async generateTokens(userId: string, role: Role) {
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
}
