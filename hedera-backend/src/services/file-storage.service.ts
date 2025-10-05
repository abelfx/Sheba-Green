import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileStorageService {
  private readonly uploadDir: string = './uploads';
  private readonly maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes: string[] = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  constructor(private configService: ConfigService) {}

  /**
   * Save a file to local storage with validation
   * @param file - The uploaded file from multer
   * @param prefix - Optional prefix for organizing files (e.g., userId/reportId)
   * @returns The relative file path where the file was saved
   */
  async saveFile(file: Express.Multer.File, prefix?: string): Promise<string> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileExtension = this.getFileExtension(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;

    // Construct full path
    const directory = prefix
      ? path.join(this.uploadDir, prefix)
      : this.uploadDir;
    const fullPath = path.join(directory, uniqueFilename);

    // Ensure directory exists
    await this.ensureDirectoryExists(directory);

    // Write file to disk
    await fs.writeFile(fullPath, file.buffer);

    // Return relative path
    return fullPath;
  }

  /**
   * Get the full file path from a filename
   * @param filename - The filename or relative path
   * @returns The full absolute path to the file
   */
  getFilePath(filename: string): string {
    return path.resolve(filename);
  }

  /**
   * Validate file type and size
   * @param file - The uploaded file to validate
   * @throws BadRequestException if validation fails
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // Additional validation: check if buffer exists
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }
  }

  /**
   * Ensure directory exists, create if it doesn't
   * @param directory - The directory path to ensure exists
   */
  private async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await fs.access(directory);
    } catch {
      // Directory doesn't exist, create it recursively
      await fs.mkdir(directory, { recursive: true });
    }
  }

  /**
   * Extract file extension from filename
   * @param filename - The original filename
   * @returns The file extension including the dot (e.g., '.jpg')
   */
  private getFileExtension(filename: string): string {
    const ext = path.extname(filename);
    return ext || '.jpg'; // Default to .jpg if no extension
  }
}
