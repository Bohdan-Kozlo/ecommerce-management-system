import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth, AdminAuth } from 'src/common/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/types';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Auth()
  async getMe(@CurrentUser() user: AuthUser) {
    const userData = await this.userService.findById(user.userId);
    return userData;
  }

  @Patch('me')
  @Auth()
  updateProfile(@CurrentUser() user: AuthUser, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUserProfile(user.userId, updateUserDto);
  }

  @Get(':id')
  @AdminAuth()
  getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get()
  @AdminAuth()
  getUsers() {
    return this.userService.findAll();
  }
}
