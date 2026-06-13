import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SubscriptionStatus } from 'apps/payments/src/generated/prisma/enums';
import { SubscriptionQueryRepository } from '../../infrastructure/query/subscription.query.repository';

export class GetCurrentPaymentSubscriptionQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetCurrentPaymentSubscriptionQuery)
export class GetCurrentPaymentSubscriptionHandler
  implements IQueryHandler<GetCurrentPaymentSubscriptionQuery, any | null>
{
  constructor(private readonly subscriptionQueryRepository: SubscriptionQueryRepository,) {}

  async execute({ userId }: GetCurrentPaymentSubscriptionQuery): Promise<any | null> {
    const subscription = await this.subscriptionQueryRepository.getMyCurrent(userId);

    if (!subscription) return null;

    return {
      subscriptionId: subscription.id,
      expireAt: subscription.expireAt?.toISOString() ?? null,
      autoRenewal: subscription.autoRenewal,
      planId: subscription.planId,
    };
  }
}
