import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ReportsController,
  VerificationsController,
  UsersController,
  DidsController,
  HcsController,
  HealthController,
} from '../controllers';
import { FeedController } from '../controllers/feed.controller';
import { LeaderboardController } from '../controllers/leaderboard.controller';
import { StatisticsController } from '../controllers/statistics.controller';
import { UseCasesModule } from './use-cases.module';
import { RepositoriesModule } from './repositories.module';
import { ServicesModule } from './services.module';

@Module({
  imports: [
    UseCasesModule,
    RepositoriesModule,
    ServicesModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [
    ReportsController,
    VerificationsController,
    UsersController,
    DidsController,
    HcsController,
    HealthController,
    FeedController,
    LeaderboardController,
    StatisticsController,
  ],
})
export class ControllersModule {}
