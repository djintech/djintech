import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SubscriptionDto } from "../dto/subscription.dto";
import { PlanQueryRepository } from "../../infrastructure/query/plan.query.repository";
import { SubscriptionsRepository } from "../../infrastructure/subscriptions.repository";
import { SubscriptionStatus } from "apps/payments/src/generated/prisma/client";
import { PaymentFactory } from "../../infrastructure/payment.factory";
import { STRIPE_PRICE_MAP } from "@libs/contracts/payments/subscription";
import { CreateSubscriptionResponse } from "@libs/contracts/payments/create-subscription";
import { RpcException } from "@nestjs/microservices";

export class CreateSubscriptionCommand {
  constructor(
    public readonly dto: SubscriptionDto
  ) {}
}

@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionUseCase
  implements ICommandHandler<CreateSubscriptionCommand, CreateSubscriptionResponse>
{
  constructor( 
    private readonly paymentFactory: PaymentFactory,
    private readonly planQueryRepository: PlanQueryRepository,
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  async execute({ dto }: CreateSubscriptionCommand): Promise<CreateSubscriptionResponse> {
    const { userId, email, planId, paymentType } = dto;

    const plan = await this.planQueryRepository.getById( planId );
    if ( !plan ) throw new RpcException('Plan not found');
    
    const existing = await this.subscriptionsRepository.findActiveOrPendingByUserId( userId );

    const provider = this.paymentFactory.get(paymentType);
    const priceId = paymentType === 'STRIPE' 
      ? STRIPE_PRICE_MAP[plan.subscriptionType]
      : undefined//PAYPAL_PLAN_MAP[plan.subscriptionType];  

    if (!priceId) throw new RpcException('PriceId not found for subscription type');

    let customerId = existing?.customerId;
    if (!customerId) {
      const customer = await provider.createCustomer( email );
      customerId = customer.id;
    }

    const session = await provider.createSession({ customerId: customerId, priceId });

    if (existing && existing.status === SubscriptionStatus.PENDING) {
      await this.subscriptionsRepository.update(existing.id, {
        externalId: session.id,
        ...(existing.planId !== planId && {
          plan: { connect: { id: planId } },
        }),
      });
    } else {
      if (existing && existing.status === SubscriptionStatus.ACTIVE) {
        await this.subscriptionsRepository.update(existing.id, { autoRenewal: false });
      }
      await this.subscriptionsRepository.create({
        userId,
        customerId,
        plan: { connect: { id: dto.planId } },
        status: SubscriptionStatus.PENDING,
        autoRenewal: true,
        externalId: session.id,
        paymentType: paymentType,
        providerSubscriptionId: null,
      });
    }

    return { url: session.url };
  }  
}
 