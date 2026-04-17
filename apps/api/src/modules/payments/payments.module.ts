import { PAYMENTS_SERVICE } from "@libs/constants";
import { Global, Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { PaymentsClientService } from "./infrastructure/payments.client";
import { PaymentsConfigModule } from "@src/config/payments/payments-config.module";
import { PaymentsConfig } from "@src/config/payments/payments.config";

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PAYMENTS_SERVICE,
        imports: [PaymentsConfigModule],
        useFactory: (config: PaymentsConfig) => (
          {
          transport: Transport.TCP,
          options: {
            host: config.paymentsServiceHost || 'payments-mono-service',
            port: config.paymentsServicePort || 4180,
          },
        }),
          inject: [PaymentsConfig],
      },
    ]),
  ],
  providers: [PaymentsClientService],
  exports: [PaymentsClientService],
})
export class PaymentsModule {}