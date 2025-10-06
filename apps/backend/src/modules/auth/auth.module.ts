import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AccessJwtStrategy } from './strategies/accessJwt.strategy';
import { RefreshJwtStrategy } from './strategies/refreshJwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { EmailUserFactory } from './factories/email-user.factory';
import { GoogleUserFactory } from './factories/google-user.factory';
import { UserFactoryProvider } from './factories/user-factory.provider';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string | number>('JWT_ACCESS_EXPIRATION'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    AccessJwtStrategy,
    RefreshJwtStrategy,
    GoogleStrategy,
    EmailUserFactory,
    GoogleUserFactory,
    UserFactoryProvider,
  ],
  exports: [AuthService],
})
export class AuthModule {}
