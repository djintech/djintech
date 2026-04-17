import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SubscriptionsController } from './api/subscriptions.controller';

const commandHandlers = [
];

const queryHandlers = [
];

@Module({
  imports: [
    CqrsModule,
  ],
  controllers: [
    SubscriptionsController,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
 //   SubscriptionsRepository,
 //   SubscriptionsQueryRepository,
  ],
})
export class SubscriptionsModule {}