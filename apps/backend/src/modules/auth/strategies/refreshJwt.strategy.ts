import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/common/types/types';
import type { Request as ExpressRequest } from 'express';

const createCookieExtractor = (cookieName: string) => {
  return (req?: ExpressRequest): string | null => {
    if (!req) return null;
    const cookies = (req as unknown as { cookies?: Record<string, string> }).cookies;
    if (!cookies) return null;
    const token = cookies[cookieName];
    return typeof token === 'string' && token.length > 0 ? token : null;
  };
};

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        createCookieExtractor(configService.getOrThrow('JWT_REFRESH_COOKIE')),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET') as string,
    });
  }

  validate(payload: JwtPayload) {
    return { userId: payload.sub, role: payload.role };
  }
}
