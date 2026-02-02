import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { FilesModule } from './files.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FilesModule,
    {
      transport: Transport.TCP,
    },
  );
  await app.listen();
}
bootstrap();
