import { Module } from '@nestjs/common';
import {
  ReportService,
  VerificationService,
  UserService,
  DidService,
} from '../services';
import { RepositoriesModule } from './repositories.module';
import { ServicesModule } from './services.module';

@Module({
  imports: [RepositoriesModule, ServicesModule],
  providers: [ReportService, VerificationService, UserService, DidService],
  exports: [ReportService, VerificationService, UserService, DidService],
})
export class UseCasesModule {}
