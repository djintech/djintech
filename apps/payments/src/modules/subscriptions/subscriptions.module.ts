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
import { CancelAutoRenewalUseCase } from './application/usecases/cancel-auto-renewal.usecase';
import { RenewAutoRenewalUseCase } from './application/usecases/renew-auto-renewal.usecase';
import { GetMyPaymentsHandler } from './application/queries/get-my-payments.query';
import { GetCurrentPaymentSubscriptionHandler } from './application/queries/get-current-payment-subscription.query';
import { SubscriptionQueryRepository } from './infrastructure/query/subscription.query.repository';

const commandHandlers = [
  CreateSubscriptionUseCase,
  CancelAutoRenewalUseCase,
  RenewAutoRenewalUseCase,
  StripeWebhookUseCase,
];

const queryHandlers = [
  GetPlansHandler,
  GetMyPaymentsHandler,
  GetCurrentPaymentSubscriptionHandler,
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
    SubscriptionQueryRepository,
 //   SubscriptionsQueryRepository,
  ],
})
export class SubscriptionsModule {}
