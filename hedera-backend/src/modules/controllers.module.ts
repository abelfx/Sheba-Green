import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import {
  ReportsController,
  VerificationsController,
  UsersController,
  DidsController,
  HcsController,
  HealthController,
} from '../controllers';
import { UseCasesModule } from './use-cases.module';
import { RepositoriesModule } from './repositories.module';
import { ServicesModule } from './services.module';

@Module({
  imports: [
    UseCasesModule,
    RepositoriesModule,
    ServicesModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [
    ReportsController,
    VerificationsController,
    UsersController,
    DidsController,
    HcsController,
    HealthController,
  ],
})
export class ControllersModule {}
