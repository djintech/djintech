import { PATTERN_CREATE_SUBSCRIPTION, PATTERN_GET_PLANS } from "@libs/constants";
import { Controller, Post, Req, Headers } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { MessagePattern } from "@nestjs/microservices";
import { GetPlansQuery } from "../application/queries/get-plan.query";
import { Plan } from "apps/payments/src/generated/prisma/client";
import { CreateSubscriptionCommand } from "../application/usecases/create-subscription.usecase";
import { CreateSubscriptionRequest, CreateSubscriptionResponse } from "@libs/contracts/payments/create-subscription";
import { StripeWebhookCommand } from "../application/usecases/stripe-webhook.use-case";

export interface RawBodyRequest extends Request {
  rawBody: Buffer;
}

@Controller()
export class SubscriptionsController {
  constructor( 
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @MessagePattern(PATTERN_CREATE_SUBSCRIPTION)
  async createSubscription( payload: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    return this.commandBus.execute( new CreateSubscriptionCommand( payload));
  }
  
  @MessagePattern(PATTERN_GET_PLANS)
  getPlan(): Promise<Plan[]> {
    return this.queryBus.execute(new GetPlansQuery());
  }

  @Post('webhooks/stripe')
  async stripeWebhook(
    @Req() req: RawBodyRequest,
    @Headers('stripe-signature') signature: string,
  ) {
    await  this.commandBus.execute( new StripeWebhookCommand(signature, req.rawBody) );

    return { received: true };
  }
}
