import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.setGlobalPrefix('api');
  await app.listen(process.env.port ?? 3000);
  console.log('ENV NODE_ENV= ', process.env.NODE_ENV)
}
bootstrap();
