import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SubscriptionsController } from './api/subscriptions.controller';
import { PlanQueryRepository } from './infrastructure/query/plan.query.repository';
import { GetPlansHandler } from './application/queries/get-plan.query';
import { CreateSubscriptionUseCase } from './application/usecases/create-subscription.usecase';
import { StripeWebhookUseCase } from './application/usecases/stripe-webhook.use-case';
import { PaymentFactory } from './infrastructure/payment.factory';
import { SubscriptionsRepository } from './infrastructure/subscriptions.repository';
import { StripeAdapter } from './application/stripe.adapter';
import { PayPalAdapter } from './application/paypal.adapter';

const commandHandlers = [
  CreateSubscriptionUseCase,
  StripeWebhookUseCase,
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
    PaymentFactory,
    StripeAdapter,
    PayPalAdapter,
    SubscriptionsRepository,
 //   SubscriptionsQueryRepository,
  ],
})
export class SubscriptionsModule {}
