import { DynamicModule, Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ApiCoreModule } from './core/api.core.module';
import { CoreConfig } from './core/config/core.config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './db/prisma.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TestingModule } from './modules/testing/testing.modules';
import { configModule } from '@libs/config/config-dynamic-module';
import { ServiceName } from '@libs/config/configuration';
import { CoreModule } from '@libs/core/core.module';
import { DomainHttpExceptionsFilter } from '@libs/core/exceptions/filters/domain-exceptions.filter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SessionsModule } from '@modules/sessions/sessions.module';
import { PoliciesModule } from '@modules/privacy/policies.module';
import { PostModule } from './modules/posts/posts.module';
import { FilesModule } from './modules/files/files.module';
import { UuidModule } from '@libs/utils/src/uuid/uuid.module';
import { CleanupModule } from './modules/cleanup/cleanup.module';
import { FileModule } from './core/file/file.module';

@Module({
  imports: [
    configModule(ServiceName.API), // 🔝 should be on top!
    CoreModule,
    ApiCoreModule,
    PrismaModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: Number(process.env.THROTTLE_TTL), 
          limit: Number(process.env.THROTTLE_LIMIT)
        },
      ],
    }),
    FilesModule,
    UuidModule,
    UserAccountsModule,
    NotificationsModule,
    SessionsModule,
    PoliciesModule,
    PostModule,
    CleanupModule,
    FileModule,
  ],
  controllers: [ApiController],
  providers: [
    ApiService,
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
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
