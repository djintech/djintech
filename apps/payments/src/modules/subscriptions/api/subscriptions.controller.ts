import { PATTERN_CANCEL_AUTO_RENEWAL_SUBSCRIPTION, PATTERN_CREATE_SUBSCRIPTION, PATTERN_GET_PLANS, PATTERN_RENEW_AUTO_RENEWAL_SUBSCRIPTION } from "@libs/constants";
import { Controller, Post, Req, Headers, Res, BadRequestException } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { MessagePattern } from "@nestjs/microservices";
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

export interface RawBodyRequest extends Request {
  rawBody: Buffer;
}

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
    console.log('CancelAutoRenewalCommand received for userId:', payload.userId);
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

  @Post('webhooks/stripe')
  stripeWebhook( @Req() req: Request, @Headers('stripe-signature') signature: string ) {
    const rawBody = (req as any).rawBody;
  
    // Верификация — синхронно, ДО return
    try {
      this.stripeAdapter.constructWebhookEvent(rawBody, signature);
    } catch {
      throw new BadRequestException('Invalid signature');
    }
    
    // Обработка — асинхронно, в фоне
    void this.commandBus.execute(new StripeWebhookCommand(signature, rawBody as Buffer));
    
    return { received: true };
    
    // try {
    //   const rawBody = (req as any).rawBody;
    //   void this.commandBus
    //     .execute( new StripeWebhookCommand(signature, rawBody as Buffer) )
    //     .catch((err) => {
    //       console.error('Stripe webhook async error:', err);
    //     });

    //   return { received: true };

    // } catch (err) {
    //   console.error('❌ Stripe webhook signature verification failed:', (err as any).message);
    // }
  }
}
