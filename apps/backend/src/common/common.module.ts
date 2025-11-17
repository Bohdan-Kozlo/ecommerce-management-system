import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseStorageModule } from './supabaseStorage/supabaseStorage.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, SupabaseStorageModule, ConfigModule.forRoot({ isGlobal: true })],
})
export class CommonModule {}
