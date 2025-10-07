import { Injectable } from '@nestjs/common';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class CliService {
  constructor(private readonly userService: UserService) {}

  async grantAdminRole(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    if (user.role === 'ADMIN') {
      console.log(`User ${email} already has admin rights`);
      return;
    }

    await this.userService.grantAdminRole(user.id);
    console.log(`Admin rights granted to user ${email}`);
    console.log('Refresh token cleared');
  }
}
