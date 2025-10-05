import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import {
  HederaService,
  DetectionService,
  FileStorageService,
} from '../services';
import { CloudinaryService } from '../services/cloudinary.service';
import { FeedService } from '../services/feed.service';
import { LeaderboardService } from '../services/leaderboard.service';
import { StatisticsService } from '../services/statistics.service';
import { RepositoriesModule } from './repositories.module';
import { ModelsModule } from './models.module';

@Module({
  imports: [HttpModule, RepositoriesModule, ModelsModule],
  providers: [
    HederaService,
    DetectionService,
    FileStorageService,
    CloudinaryService,
    FeedService,
    LeaderboardService,
    StatisticsService,
  ],
  exports: [
    HederaService,
    DetectionService,
    FileStorageService,
    CloudinaryService,
    FeedService,
    LeaderboardService,
    StatisticsService,
  ],
})
export class ServicesModule {}
