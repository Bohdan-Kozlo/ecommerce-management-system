import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessJwtGuard } from 'src/common/guards/acessJwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/types';
import { UpdateUserDto } from './dto/updateUser.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AccessJwtGuard)
  async getMe(@CurrentUser() user: AuthUser) {
    const userData = await this.userService.findById(user.userId);
    return userData;
  }

  @Patch('me')
  @UseGuards(AccessJwtGuard)
  updateProfile(@CurrentUser() user: AuthUser, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUserProfile(user.userId, updateUserDto);
  }

  @Get(':id')
  @UseGuards(AccessJwtGuard, AdminGuard)
  getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get()
  @UseGuards(AccessJwtGuard, AdminGuard)
  getUsers() {
    return this.userService.findAll();
  }
}
