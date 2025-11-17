import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageClient } from '@supabase/storage-js';
import { SupabaseStorageService } from './supabaseStorage.service';
import { SUPABASE_CLIENT } from './supabase.constant';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: (configService: ConfigService) => {
        const storageUrl = configService.getOrThrow<string>('STORAGE_URL');
        const storageKey = configService.getOrThrow<string>('STORAGE_API_KEY');

        return new StorageClient(storageUrl, {
          apikey: storageKey,
          Authorization: `Bearer ${storageKey}`,
        });
      },
      inject: [ConfigService],
    },
    SupabaseStorageService,
  ],
  exports: [SUPABASE_CLIENT, SupabaseStorageService],
})
export class SupabaseStorageModule {}
