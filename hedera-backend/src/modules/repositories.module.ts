import { Module } from '@nestjs/common';
import {
  UserRepository,
  ReportRepository,
  TokenRepository,
  HcsMessageRepository,
} from '../repositories';
import { ModelsModule } from './models.module';

@Module({
  imports: [ModelsModule],
  providers: [
    UserRepository,
    ReportRepository,
    TokenRepository,
    HcsMessageRepository,
  ],
  exports: [
    UserRepository,
    ReportRepository,
    TokenRepository,
    HcsMessageRepository,
  ],
})
export class RepositoriesModule {}
