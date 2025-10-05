import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import {
  HederaService,
  DetectionService,
  FileStorageService,
} from '../services';
import { RepositoriesModule } from './repositories.module';

@Module({
  imports: [HttpModule, RepositoriesModule],
  providers: [HederaService, DetectionService, FileStorageService],
  exports: [HederaService, DetectionService, FileStorageService],
})
export class ServicesModule {}
