import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { SubscriptionsController } from './api/subscriptions.controller';
import { GetPlansHandler } from './application/queries/get-plans.query';
import { CreateSubscriptionUseCase } from './application/usecases/create-subscription.usecase';
import { CancelAutoRenewalUseCase } from './application/usecases/cancel-auto-renewal.usecase';
import { RenewAutoRenewalUseCase } from './application/usecases/renew-auto-renewal.usecase';
import { StripeWebhooksController } from './api/webhooks.controller';
import { StripeWebhookUseCase } from './application/usecases/stripe-webhook.use-case';

const commandHandlers = [
  CreateSubscriptionUseCase,
  CancelAutoRenewalUseCase,
  RenewAutoRenewalUseCase,
  StripeWebhookUseCase,
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
    StripeWebhooksController,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class SubscriptionsModule {}