import { FILES_SERVICE } from "@libs/constants";
import { Global, Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { FilesClientService } from "./infrastructure/files.client";
import { FilesConfigModule } from "@src/config/files/files-config.module";
import { FilesConfig } from "@src/config/files/files.config";

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: FILES_SERVICE,
        imports: [FilesConfigModule],
        useFactory: (filesConfig: FilesConfig) => (
          {
          transport: Transport.TCP,
          options: {
            host: filesConfig.fileServiceHost || 'files-mono-service',
            port: filesConfig.fileServicePort || 4177,
          },
        }),
          inject: [FilesConfig],
      },
    ]),
  ],
  providers: [FilesClientService],
  exports: [FilesClientService],
})
export class FilesModule {}