import { Injectable, BadRequestException } from '@nestjs/common';
import { IUserFactory, BaseUserData, GoogleUserData, AuthProvider } from './interfaces';
import { UserService } from '../user.service';

@Injectable()
export class GoogleUserFactory implements IUserFactory {
  constructor(private userService: UserService) {}

  async createUserWithValidation(data: BaseUserData) {
    this.validateUserData(data);
    const result = await this.createUser(data);
    return result;
  }
  async createUser(data: BaseUserData) {
    const googleData = data as GoogleUserData;
    let user = await this.userService.findByGoogleId(googleData.googleId);
    if (user) {
      return {
        user,
        isNewUser: false,
        provider: AuthProvider.GOOGLE,
      };
    }
    user = await this.userService.findByEmail(googleData.email);

    if (user) {
      user = await this.userService.update(user.id, {
        googleId: googleData.googleId,
      });

      return {
        user,
        isNewUser: false,
        provider: AuthProvider.GOOGLE,
      };
    }
    user = await this.userService.create({
      googleId: googleData.googleId,
      email: googleData.email,
      firstName: googleData.firstName,
      lastName: googleData.lastName,
      password: '',
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
}
