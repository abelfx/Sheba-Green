import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DetectionService } from './detection.service';
import { ServiceUnavailableException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('DetectionService', () => {
  let service: DetectionService;
  let httpService: HttpService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'detection.apiUrl') {
        return 'http://localhost:8000';
      }
      return null;
    }),
  };

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DetectionService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<DetectionService>(DetectionService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load detection API URL from config', () => {
    expect(mockConfigService.get).toHaveBeenCalledWith('detection.apiUrl');
  });

  describe('checkHealth', () => {
    it('should return true when service is available', async () => {
      const mockResponse = {
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      } as AxiosResponse;

      mockHttpService.get.mockReturnValueOnce(of(mockResponse));

      const result = await service.checkHealth();

      expect(result).toBe(true);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'http://localhost:8000/health',
        { timeout: 5000 },
      );
    });

    it('should return false when service is unavailable', async () => {
      mockHttpService.get.mockReturnValueOnce(
        throwError(() => new Error('Network error')),
      );

      const result = await service.checkHealth();

      expect(result).toBe(false);
    });
  });

  describe('predictTrash', () => {
    it('should throw ServiceUnavailableException on HTTP error', async () => {
      mockHttpService.post.mockReturnValueOnce(
        throwError(() => new Error('Network error')),
      );

      await expect(service.predictTrash('/path/to/image.jpg')).rejects.toThrow(
        ServiceUnavailableException,
      );
      await expect(service.predictTrash('/path/to/image.jpg')).rejects.toThrow(
        'AI Detection service is currently unavailable',
      );
    });
  });

  describe('verifyCleanup', () => {
    it('should throw ServiceUnavailableException on HTTP error', async () => {
      mockHttpService.post.mockReturnValueOnce(
        throwError(() => new Error('Network error')),
      );

      await expect(
        service.verifyCleanup('/path/to/image.jpg', 'Test prompt'),
      ).rejects.toThrow(ServiceUnavailableException);
      await expect(
        service.verifyCleanup('/path/to/image.jpg', 'Test prompt'),
      ).rejects.toThrow('AI Detection service is currently unavailable');
    });
  });
});
