import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DomainRpcExceptionsFilter } from '@libs/core/exceptions/filters/domain-rpc-exceptions.filter';
import { PaymentsAppModule } from './payments-app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 1. HTTP APP (для API + Stripe webhooks)
  const app = await NestFactory.create(PaymentsAppModule, {
    rawBody: true, // важно для Stripe signature validation
  });

  // 2. Global pipes (если используешь DTO validation)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 3. Global filters (RPC ошибки для микросервисов)
  app.useGlobalFilters(new DomainRpcExceptionsFilter());

  // 5. TCP microservice (для API ↔ payments communication)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: Number(process.env.PAYMENTS_SERVICE_PORT || '4180'),
    },
  });

  // 6. Start microservices + HTTP server
  await app.startAllMicroservices();

  const port = Number(process.env.PAYMENTS_HTTP_PORT || 3001);

  await app.listen(port);

  console.log(`🚀 Payments HTTP running on port ${port}`);
  console.log(`⚡ TCP microservice listening on ${process.env.PAYMENTS_SERVICE_PORT}`,);
}

bootstrap();

// async function bootstrap() {
//   const app = await NestFactory.createMicroservice<MicroserviceOptions>(
//     PaymentsAppModule,
//     {
//       transport: Transport.TCP,
//       options: {
//         host: '0.0.0.0',
//         port: Number(process.env.PAYMENTS_SERVICE_PORT || '4180'),
//       },
//     },
//   );

//   app.useGlobalFilters(new DomainRpcExceptionsFilter());

//   await app.listen();
//   console.log(
//     'Payments TCP microservice listening on',
//     process.env.PAYMENTS_SERVICE_PORT,
//   );
// }
// bootstrap();