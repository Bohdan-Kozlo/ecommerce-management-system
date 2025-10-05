import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CliService } from './cli.service';

@Module({
  imports: [UserModule, PrismaModule],
  providers: [CliService],
  exports: [CliService],
})
export class CliModule {}
