import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DomainRpcExceptionsFilter } from '@libs/core/exceptions/filters/domain-rpc-exceptions.filter';
import { PaymentsAppModule } from './payments-app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsAppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.PAYMENTS_SERVICE_PORT ?? 4180),
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new DomainRpcExceptionsFilter());

  await app.listen();

  console.log(`⚡ TCP microservice listening on ${process.env.PAYMENTS_SERVICE_PORT}`,);
}

bootstrap();
