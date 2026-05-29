import { PATTERN_CANCEL_AUTO_RENEWAL_SUBSCRIPTION, PATTERN_CREATE_SUBSCRIPTION, PATTERN_GET_MY_PAYMENTS_SUBSCRIPTION, PATTERN_GET_PLANS, PATTERN_RENEW_AUTO_RENEWAL_SUBSCRIPTION, PATTERN_STRIPE_WEBHOOK } from "@libs/constants";
import { Controller, Post, Req, Headers, BadRequestException } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { GetPlansQuery } from "../application/queries/get-plan.query";
import { Plan } from "apps/payments/src/generated/prisma/client";
import { CreateSubscriptionCommand } from "../application/usecases/create-subscription.usecase";
import { CreateSubscriptionRequest, CreateSubscriptionResponse } from "@libs/contracts/payments/create-subscription";
import { StripeWebhookCommand } from "../application/usecases/stripe-webhook.use-case";
import { StripeAdapter } from "../application/stripe.adapter";
import { CancelAutoRenewalRequest, CancelAutoRenewalResponse } from "@libs/contracts/payments/cancel-auto-renewal";
import { CancelAutoRenewalCommand } from "../application/usecases/cancel-auto-renewal.usecase";
import { RenewAutoRenewalRequest, RenewAutoRenewalResponse } from "@libs/contracts/payments/renew-auto-renewal";
import { RenewAutoRenewalCommand } from "../application/usecases/renew-auto-renewal.usecase";
import { StripeWebhookRequest, StripeWebhookResponse } from "@libs/contracts/payments/stripe-webhook";
import { GetMyPaymentsRequest, PaymentsWithPaginationViewModel } from "@libs/contracts/payments/get-my-payments";
import { GetMyPaymentsQuery } from "../application/queries/get-my-payments.query";

@Controller()
export class SubscriptionsController {
  constructor( 
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly stripeAdapter: StripeAdapter,
  ) {}
  
  @MessagePattern(PATTERN_CREATE_SUBSCRIPTION)
  async createSubscription( payload: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    return this.commandBus.execute( new CreateSubscriptionCommand( payload));
  }

  @MessagePattern(PATTERN_CANCEL_AUTO_RENEWAL_SUBSCRIPTION)
  async cancelAutoRenewal( payload: CancelAutoRenewalRequest ): Promise<CancelAutoRenewalResponse> {
    return this.commandBus.execute( new CancelAutoRenewalCommand(payload.userId) );
  }

  @MessagePattern(PATTERN_RENEW_AUTO_RENEWAL_SUBSCRIPTION)
  async renewAutoRenewal( payload: RenewAutoRenewalRequest ): Promise<RenewAutoRenewalResponse> {
    return this.commandBus.execute( new RenewAutoRenewalCommand(payload.userId) );
  }
  
  @MessagePattern(PATTERN_GET_PLANS)
  getPlan(): Promise<Plan[]> {
    return this.queryBus.execute(new GetPlansQuery());
  }

  @MessagePattern(PATTERN_GET_MY_PAYMENTS_SUBSCRIPTION)
  getMyPayments(@Payload() payload: GetMyPaymentsRequest): Promise<PaymentsWithPaginationViewModel> {
    return this.queryBus.execute(new GetMyPaymentsQuery(payload));
  }

  @MessagePattern(PATTERN_STRIPE_WEBHOOK)
  async stripeWebhook( payload: StripeWebhookRequest): Promise<StripeWebhookResponse> {
    const { signature, rawBody } = payload;
    const buffer = Buffer.from(rawBody, 'base64');

    this.stripeAdapter.constructWebhookEvent(buffer, signature);
    // Обработка — асинхронно, в фоне
    void this.commandBus.execute(new StripeWebhookCommand(signature, buffer));
    return { received: true };
  }
}
