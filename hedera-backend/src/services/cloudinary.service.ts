import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as crypto from 'crypto';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload image to Cloudinary
   * @param file - The uploaded file buffer
   * @param folder - Folder path in Cloudinary (e.g., 'shebagreen/reports')
   * @param publicId - Optional custom public ID
   * @returns Upload result with URL, public_id, and metadata
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'shebagreen',
    publicId?: string,
  ): Promise<{
    url: string;
    publicId: string;
    width: number;
    height: number;
    hash: string;
  }> {
    try {
      // Compute SHA-256 hash of image bytes
      const hash = crypto
        .createHash('sha256')
        .update(file.buffer)
        .digest('hex');

      // Upload to Cloudinary
      const result: UploadApiResponse = await new Promise(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              public_id: publicId,
              resource_type: 'image',
            },
            (error, result) => {
              if (error) reject(error);
              else if (result) resolve(result);
              else reject(new Error('Upload failed without error'));
            },
          );

          uploadStream.end(file.buffer);
        },
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        hash: `sha256:${hash}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to upload image to Cloudinary: ${message}`,
      );
    }
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - The public ID of the image to delete
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      // Log error but don't throw - deletion failures shouldn't block operations
      console.error(`Failed to delete image ${publicId}:`, error);
    }
  }
}
