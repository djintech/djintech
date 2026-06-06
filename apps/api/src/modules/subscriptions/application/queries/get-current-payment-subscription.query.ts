import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaymentsClientService } from '@src/modules/payments/infrastructure/payments.client';
import { ProfilesRepository } from '@src/modules/user-accounts/profile/infrastructure/profiles.repository';
import { CurrentPaymentSubscriptionViewDto } from '@src/modules/subscriptions/api/view-dto/current-payment-subscription.view-dto';
import { addDays } from 'date-fns';
import { AccountType } from '@src/generated/prisma/enums';

export class GetCurrentPaymentSubscriptionQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetCurrentPaymentSubscriptionQuery)
export class GetCurrentPaymentSubscriptionHandler
  implements IQueryHandler<GetCurrentPaymentSubscriptionQuery, CurrentPaymentSubscriptionViewDto | null>
{
  constructor(
    private readonly paymentsClient: PaymentsClientService,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async execute({ userId }: GetCurrentPaymentSubscriptionQuery): Promise<CurrentPaymentSubscriptionViewDto | null> {
    const subscription = await this.paymentsClient.getCurrentPaymentSubscription({ userId });

    if (!subscription) return null;

    const profile = await this.profilesRepository.findeByUserId(userId);

    const accountType = profile?.accountType ?? AccountType.Business;
    const nextPaymentDate = (subscription.autoRenewal === true && subscription.expireAt !== null)
      ? addDays(subscription.expireAt, 1).toISOString()
      : null;

    return {
      subscriptionId: subscription.subscriptionId,
      accountType,
      expireAt: subscription.expireAt,
      nextPaymentDate,
      autoRenewal: subscription.autoRenewal,
      planId: subscription.planId,
    };
  }
}
