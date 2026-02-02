import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FILE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.FILE_SERVICE_HOST || 'files-mono-service',
          port: Number( process.env.FILE_SERVICE_PORT || '4177'),
        }

      }
    ])
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
