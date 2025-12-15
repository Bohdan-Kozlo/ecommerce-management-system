import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Prisma } from '@prisma/client';

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

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      omit: { password: true, refreshToken: true, refreshTokenExpiresAt: true, googleId: true },
    });
  }

  async updateUserProfile(userId: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async grantAdminRole(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: 'ADMIN',
        refreshToken: null,
        refreshTokenExpiresAt: null,
      },
    });
  }
}
