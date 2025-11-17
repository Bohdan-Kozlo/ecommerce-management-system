import { Inject, Injectable } from '@nestjs/common';
import { StorageClient } from '@supabase/storage-js';
import { randomUUID } from 'crypto';
import { SUPABASE_CLIENT } from './supabase.constant';

@Injectable()
export class SupabaseService {
  private readonly bucketName = 'products';

  constructor(@Inject(SUPABASE_CLIENT) private storage: StorageClient) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      console.log('Starting file upload to Supabase:', {
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        bucket: this.bucketName,
      });

      const fileExt = file.originalname.split('.').pop();
      const fileName = `${randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await this.storage
        .from(this.bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      const { data: publicUrlData } = this.storage.from(this.bucketName).getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];

      if (!fileName) {
        return;
      }

      await this.storage.from(this.bucketName).remove([fileName]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error parsing file URL: ${errorMessage}`);
    }
  }

  async deleteFiles(fileUrls: string[]): Promise<void> {
    await Promise.all(fileUrls.map((url) => this.deleteFile(url)));
  }
}
