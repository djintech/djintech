import { Module } from '@nestjs/common';
import { CoreModule } from '@libs/core/core.module';
import { configModule } from '@libs/config/config-dynamic-module';
import { ServiceName } from '@libs/config/configuration';
import { PrismaModule } from './db/prisma.module';

@Module({
  imports: [
    configModule(ServiceName.PAYMENTS),
    CoreModule, // 🔝 всегда первым!
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class PaymentsAppModule {}
