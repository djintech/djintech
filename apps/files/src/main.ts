import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { FilesAppModule } from './files-app.module';
import { DomainRpcExceptionsFilter } from '@libs/core/exceptions/filters/domain-rpc-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FilesAppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.FILE_SERVICE_PORT || '4177'),
      },
    },
  );

  app.useGlobalFilters(new DomainRpcExceptionsFilter());
  
  await app.listen();
  console.log('Files TCP microservice listening on ', process.env.FILE_SERVICE_PORT);
}
bootstrap();
