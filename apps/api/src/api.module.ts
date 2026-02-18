import { DynamicModule, Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiCoreModule } from './core/api.core.module';
import { CoreConfig } from './core/config/core.config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './db/prisma.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TestingModule } from './modules/testing/testing.modules';
import { configModule } from '@libs/config/config-dynamic-module';
import { ServiceName } from '@libs/config/configuration';
import { CoreModule } from '@libs/core/core.module';
import { DomainHttpExceptionsFilter } from '@libs/core/exceptions/filters/domain-exceptions.filter';

@Module({
  imports: [
    configModule(ServiceName.API), // 🔝 should e on top!
    CoreModule,
    ApiCoreModule,
    PrismaModule,
    ClientsModule.register([
      {
        name: 'FILE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.FILE_SERVICE_HOST || 'files-mono-service',
          port: Number(process.env.FILE_SERVICE_PORT || '4177'),
        },
      },
    ]),
    UserAccountsModule,
    NotificationsModule,
  ],
  controllers: [ApiController],
  providers: [
    ApiService,
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
  exports: [],
})
export class ApiModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    return {
      module: ApiModule,
      imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])], // Add dynamic modules here
    };
  }
}
