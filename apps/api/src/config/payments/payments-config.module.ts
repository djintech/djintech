import { Module } from '@nestjs/common';
import { CoreModule } from '@libs/core/core.module';
import { PaymentsConfig } from './payments.config';

@Module({
  imports: [CoreModule],
  providers: [PaymentsConfig],
  exports: [PaymentsConfig],
})
export class PaymentsConfigModule {}
