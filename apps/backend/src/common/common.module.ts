import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, SupabaseModule, ConfigModule.forRoot({ isGlobal: true })],
})
export class CommonModule {}
