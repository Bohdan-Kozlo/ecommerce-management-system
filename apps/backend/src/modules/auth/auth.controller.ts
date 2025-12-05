import { Controller, Post, UseGuards, Request, Body, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from 'src/common/guards/local.guard';
import { GoogleGuard } from 'src/common/guards/google.guard';
import { RefreshJwtGuard } from 'src/common/guards/refreshJwt.guard';
import { Auth } from 'src/common/decorators/auth.decorator';
import type { AuthRequest, GoogleAuthRequest, JwtAuthRequest } from 'src/common/types/types';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';
import { JwtTokenService } from './jwtToken.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtTokenService: JwtTokenService,
    private configService: ConfigService,
  ) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Request() req: AuthRequest, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(req.user);

    this.jwtTokenService.setRefreshTokenCookie(res, result.refreshToken);
    this.jwtTokenService.setAccessTokenCookie(res, result.accessToken);

    return {
      user: result.user,
    };
  }

  @Post('register')
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(body);

    this.jwtTokenService.setRefreshTokenCookie(res, result.refreshToken);
    this.jwtTokenService.setAccessTokenCookie(res, result.accessToken);

    return {
      user: result.user,
    };
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  async googleAuthCallback(@Request() req: GoogleAuthRequest, @Res() res: Response) {
    const result = await this.authService.handleGoogleLogin(req.user);

    this.jwtTokenService.setRefreshTokenCookie(res, result.refreshToken);
    this.jwtTokenService.setAccessTokenCookie(res, result.accessToken);

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const redirectPath = req.user.redirectPath || '/';

    return res.redirect(`${frontendUrl}${redirectPath}`);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refresh(@Request() req: JwtAuthRequest, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.refreshToken || '';
    const result = await this.authService.refreshTokens(req.user.userId, refreshToken);

    this.jwtTokenService.setRefreshTokenCookie(res, result.refreshToken);
    this.jwtTokenService.setAccessTokenCookie(res, result.accessToken);

    return {
      user: result.user,
    };
  }

  @Auth()
  @Post('logout')
  async logout(@Request() req: JwtAuthRequest, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.userId);

    this.jwtTokenService.clearRefreshTokenCookie(res);
    this.jwtTokenService.clearAccessTokenCookie(res);

    return;
  }
}
