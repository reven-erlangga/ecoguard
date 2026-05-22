import { Injectable, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  onModuleInit() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('Cloudinary Service initialized successfully.');
  }

  /**
   * Upload an image buffer directly to Cloudinary.
   * Returns the secure public URL of the uploaded image.
   */
  async uploadImage(file: any, folder: string = 'resolutions'): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Cloudinary upload result is undefined'));
          resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
