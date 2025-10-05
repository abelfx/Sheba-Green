import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';

// Mock fs module
jest.mock('fs/promises');

describe('FileStorageService', () => {
  let service: FileStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveFile', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'beforeImage',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      buffer: Buffer.from('fake-image-data'),
      stream: new Readable(),
      destination: '',
      filename: '',
      path: '',
    };

    beforeEach(() => {
      (fs.access as jest.Mock).mockRejectedValue(
        new Error('Directory not found'),
      );
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    });

    it('should save a valid file successfully', async () => {
      const result = await service.saveFile(mockFile);

      expect(result).toContain('uploads');
      expect(result).toContain('.jpg');
      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should save file with prefix', async () => {
      const prefix = 'user123/report456';
      const result = await service.saveFile(mockFile, prefix);

      expect(result).toContain('uploads');
      expect(result).toContain('user123/report456');
      expect(result).toContain('.jpg');
    });

    it('should throw BadRequestException if file is null', async () => {
      await expect(
        service.saveFile(null as unknown as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.saveFile(null as unknown as Express.Multer.File),
      ).rejects.toThrow('No file provided');
    });

    it('should throw BadRequestException if file size exceeds limit', async () => {
      const largeFile = {
        ...mockFile,
        size: 11 * 1024 * 1024, // 11MB (exceeds 10MB limit)
      };

      await expect(service.saveFile(largeFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.saveFile(largeFile)).rejects.toThrow(
        'File size exceeds maximum allowed size',
      );
    });

    it('should throw BadRequestException for invalid MIME type', async () => {
      const invalidFile = {
        ...mockFile,
        mimetype: 'application/pdf',
      };

      await expect(service.saveFile(invalidFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.saveFile(invalidFile)).rejects.toThrow(
        'Invalid file type',
      );
    });

    it('should throw BadRequestException if file buffer is empty', async () => {
      const emptyFile = {
        ...mockFile,
        buffer: Buffer.from(''),
      };

      await expect(service.saveFile(emptyFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.saveFile(emptyFile)).rejects.toThrow(
        'File is empty',
      );
    });

    it('should accept all allowed image types', async () => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
      ];

      for (const mimetype of allowedTypes) {
        const file = { ...mockFile, mimetype };
        const result = await service.saveFile(file);
        expect(result).toBeDefined();
      }
    });
  });

  describe('getFilePath', () => {
    it('should return absolute path for a filename', () => {
      const filename = 'uploads/test.jpg';
      const result = service.getFilePath(filename);

      expect(result).toContain('test.jpg');
      expect(path.isAbsolute(result)).toBe(true);
    });
  });
});
