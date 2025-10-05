import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for development
  app.enableCors();

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Set global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configure Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Hedera Testnet Backend API')
    .setDescription(
      'Backend API for trash cleanup verification system with Hedera blockchain integration. ' +
        'This API enables users to report trash cleanup activities, verify them through AI detection, ' +
        'and receive Sheba token rewards on the Hedera network.',
    )
    .setVersion('1.0.0')
    .addTag('Reports', 'Endpoints for creating and retrieving trash cleanup reports')
    .addTag('Verifications', 'Endpoints for verifying cleanup activities and distributing rewards')
    .addTag('Users', 'Endpoints for user management and balance queries')
    .addTag('DIDs', 'Endpoints for decentralized identifier (DID) management')
    .addTag('HCS', 'Endpoints for Hedera Consensus Service message logs')
    .addTag('Health', 'System health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
