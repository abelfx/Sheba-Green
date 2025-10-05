import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  PredictionResult,
  VerificationResult,
} from '../domain/interfaces/detection-results.interface';
import FormData = require('form-data');
import * as fs from 'fs';

@Injectable()
export class DetectionService {
  private readonly detectionApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.detectionApiUrl =
      this.configService.get<string>('detection.apiUrl') ||
      'http://localhost:8000';
  }

  async predictTrash(imagePath: string): Promise<PredictionResult> {
    try {
      const formData = new FormData();
      const fileStream = fs.createReadStream(imagePath);
      formData.append('file', fileStream);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.detectionApiUrl}/predict?use_dynamic_prompt=false`,
          formData,
          {
            headers: formData.getHeaders(),
          },
        ),
      );

      return {
        detection_result: response.data.detection_result,
        random_prompt: response.data.random_prompt,
      };
    } catch (error) {
      throw new ServiceUnavailableException(
        'AI Detection service is currently unavailable',
      );
    }
  }

  async verifyCleanup(
    imagePath: string,
    prompt: string,
  ): Promise<VerificationResult> {
    try {
      const formData = new FormData();
      const fileStream = fs.createReadStream(imagePath);
      formData.append('file', fileStream);
      formData.append('prompt', prompt);

      const response = await firstValueFrom(
        this.httpService.post(`${this.detectionApiUrl}/verify`, formData, {
          headers: formData.getHeaders(),
        }),
      );

      return {
        verified: response.data.verified,
        reason: response.data.reason,
        detection_result: response.data.detection_result,
      };
    } catch (error) {
      throw new ServiceUnavailableException(
        'AI Detection service is currently unavailable',
      );
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.detectionApiUrl}/health`, {
          timeout: 5000,
        }),
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}
