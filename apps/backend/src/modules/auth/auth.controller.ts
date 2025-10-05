import { Controller, Post, UseGuards, Request, Body, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from 'src/common/guards/local.guard';
import { GoogleGuard } from 'src/common/guards/google.guard';
import { RefreshJwtGuard } from 'src/common/guards/refreshJwt.guard';
import { AccessJwtGuard } from 'src/common/guards/acessJwt.guard';
import type { AuthRequest, GoogleAuthRequest, JwtAuthRequest } from 'src/common/types/types';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Request() req: AuthRequest, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(req.user);

    this.authService.setRefreshTokenCookie(res, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('register')
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(body);

    this.authService.setRefreshTokenCookie(res, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  async googleAuthCallback(
    @Request() req: GoogleAuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.handleGoogleLogin(req.user);

    this.authService.setRefreshTokenCookie(res, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refresh(@Request() req: JwtAuthRequest, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.refreshToken || '';
    const result = await this.authService.refreshTokens(req.user.userId, refreshToken);

    this.authService.setRefreshTokenCookie(res, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @UseGuards(AccessJwtGuard)
  @Post('logout')
  async logout(@Request() req: JwtAuthRequest, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.userId);

    this.authService.clearRefreshTokenCookie(res);

    return { message: 'Logged out successfully' };
  }
}
