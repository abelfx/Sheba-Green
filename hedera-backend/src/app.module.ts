import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';

// Feature Modules
import {
  DatabaseModule,
  ModelsModule,
  RepositoriesModule,
  ServicesModule,
  UseCasesModule,
  ControllersModule,
} from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    DatabaseModule,
    ModelsModule,
    RepositoriesModule,
    ServicesModule,
    UseCasesModule,
    ControllersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
