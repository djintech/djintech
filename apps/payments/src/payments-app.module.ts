import { Module } from '@nestjs/common';
import { CoreModule } from '@libs/core/core.module';
import { configModule } from '@libs/config/config-dynamic-module';
import { ServiceName } from '@libs/config/configuration';
import { PrismaModule } from './db/prisma.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [
    configModule(ServiceName.PAYMENTS),
    CoreModule, // 🔝 всегда первым!
    PrismaModule,
    SubscriptionsModule,
  ],
  controllers: [],
  providers: [],
})
export class PaymentsAppModule {}
