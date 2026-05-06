import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { SubscriptionsController } from './api/subscriptions.controller';
import { GetPlansHandler } from './application/queries/get-plans.query';
import { CreateSubscriptionUseCase } from './application/usecases/create-subscription.usecase';

const commandHandlers = [
  CreateSubscriptionUseCase,
];

const queryHandlers = [
  GetPlansHandler
];

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [
    SubscriptionsController,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class SubscriptionsModule {}