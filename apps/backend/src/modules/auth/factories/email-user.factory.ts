import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { IUserFactory, BaseUserData, EmailUserData, AuthProvider } from './interfaces';

@Injectable()
export class EmailUserFactory implements IUserFactory {
  constructor(private prisma: PrismaService) {}

  async createUserWithValidation(data: BaseUserData) {
    this.validateUserData(data);
    const result = await this.createUser(data);
    return result;
  }

  async createUser(data: BaseUserData) {
    const emailData = data as EmailUserData;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: emailData.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(emailData.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: emailData.email,
        firstName: emailData.firstName,
        lastName: emailData.lastName,
        password: hashedPassword,
      },
    });

    return {
      user,
      isNewUser: true,
      provider: AuthProvider.EMAIL,
    };
  }

  validateUserData(data: BaseUserData) {
    const emailData = data as EmailUserData;

    if (!emailData.email || !emailData.password) {
      throw new BadRequestException('Email and password are required');
    }

    if (emailData.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    if (!emailData.firstName || !emailData.lastName) {
      throw new BadRequestException('First name and last name are required');
    }

    return;
  }

  getProviderType(): AuthProvider {
    return AuthProvider.EMAIL;
  }
}
