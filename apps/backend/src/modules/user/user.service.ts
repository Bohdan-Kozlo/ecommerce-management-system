import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async createUser(
    data: { email: string; firstName: string; lastName: string },
    hashedPassword: string,
  ) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
      },
    });
  }

  async createGoogleUser(data: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
  }) {
    return this.prisma.user.create({
      data: {
        googleId: data.googleId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: '',
      },
    });
  }

  async linkGoogleId(userId: string, googleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { googleId },
    });
  }
}
