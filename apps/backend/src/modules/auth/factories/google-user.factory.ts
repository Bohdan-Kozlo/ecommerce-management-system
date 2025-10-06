import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { IUserFactory, BaseUserData, GoogleUserData, AuthProvider } from './interfaces';

@Injectable()
export class GoogleUserFactory implements IUserFactory {
  constructor(private prisma: PrismaService) {}

  async createUserWithValidation(data: BaseUserData) {
    this.validateUserData(data);
    const result = await this.createUser(data);
    return result;
  }

  async createUser(data: BaseUserData) {
    const googleData = data as GoogleUserData;

    let user = await this.prisma.user.findUnique({
      where: { googleId: googleData.googleId },
    });

    if (user) {
      return {
        user,
        isNewUser: false,
        provider: AuthProvider.GOOGLE,
      };
    }

    user = await this.prisma.user.findUnique({
      where: { email: googleData.email },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleData.googleId },
      });

      return {
        user,
        isNewUser: false,
        provider: AuthProvider.GOOGLE,
      };
    }

    user = await this.prisma.user.create({
      data: {
        googleId: googleData.googleId,
        email: googleData.email,
        firstName: googleData.firstName,
        lastName: googleData.lastName,
        password: '',
      },
    });

    return {
      user,
      isNewUser: true,
      provider: AuthProvider.GOOGLE,
    };
  }

  validateUserData(data: BaseUserData) {
    const googleData = data as GoogleUserData;

    if (!googleData.googleId) {
      throw new BadRequestException('Google ID is required');
    }

    if (!googleData.email) {
      throw new BadRequestException('Email is required');
    }

    if (!googleData.firstName || !googleData.lastName) {
      throw new BadRequestException('First name and last name are required');
    }

    return;
  }

  getProviderType(): AuthProvider {
    return AuthProvider.GOOGLE;
  }
}
