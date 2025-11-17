import { Request } from 'express';
import { extname } from 'path';

export const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return callback(
      new Error(`Only image files are allowed (${allowedExtensions.join(', ')})`),
      false,
    );
  }

  callback(null, true);
};

export const fileSizeLimit = 10 * 1024 * 1024; // 10MB
