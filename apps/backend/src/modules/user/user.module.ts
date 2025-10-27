import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailUserFactory, GoogleUserFactory, UserFactoryProvider } from './factories';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, EmailUserFactory, GoogleUserFactory, UserFactoryProvider],
  exports: [UserService, UserFactoryProvider],
})
export class UserModule {}
