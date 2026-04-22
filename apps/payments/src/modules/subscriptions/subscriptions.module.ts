import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SubscriptionsController } from './api/subscriptions.controller';
import { PlanQueryRepository } from './infrastructure/query/plan.query.repository';
import { GetPlansHandler } from './application/queries/get-plan.query';

const commandHandlers = [
];

const queryHandlers = [
  GetPlansHandler,
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
    PlanQueryRepository,
 //   SubscriptionsRepository,
 //   SubscriptionsQueryRepository,
  ],
})
export class SubscriptionsModule {}