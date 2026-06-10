import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RABBITMQ_CLIENT } from './subscription-events.publisher';
import { RABBITMQ_EXCHANGE, RABBITMQ_QUEUE_SUBSCRIPTION_ACTIVATED } from '@libs/constants';
import { SubscriptionEventsPublisher } from './subscription-events.publisher';
import { CoreConfig } from 'apps/payments/src/core/config/core.config';


@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_CLIENT,
        useFactory: (config: CoreConfig) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.rabbitmqUrl],
            exchange: RABBITMQ_EXCHANGE,
            exchangeType: 'topic',
            queue: RABBITMQ_QUEUE_SUBSCRIPTION_ACTIVATED,
            queueOptions: { durable: true },
          },
        }),
        inject: [CoreConfig],
      },
    ]),
  ],
  providers: [SubscriptionEventsPublisher],
  exports: [SubscriptionEventsPublisher],
})
export class RabbitMQModule {}
