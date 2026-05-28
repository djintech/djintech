import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PaymentFactory } from '../../infrastructure/payment.factory';
import { SubscriptionsRepository } from '../../infrastructure/subscriptions.repository';

export class RenewAutoRenewalCommand {
  constructor(public readonly userId: number) {}
}

@Injectable()
@CommandHandler(RenewAutoRenewalCommand)
export class RenewAutoRenewalUseCase
  implements ICommandHandler<RenewAutoRenewalCommand>
{
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly paymentFactory: PaymentFactory,
  ) {}

  async execute({ userId }: RenewAutoRenewalCommand) {
    const subscription = await this.subscriptionsRepository.findActiveOrPendingByUserId( userId );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (!subscription.providerSubscriptionId) {
      throw new BadRequestException(
        'Provider subscription id missing',
      );
    }

    if (subscription.autoRenewal) {
      return { success: true };
    }

    const provider = this.paymentFactory.get( subscription.paymentType );

    await provider.renewAutoRenewal( subscription.providerSubscriptionId );

    await this.subscriptionsRepository.update(subscription.id, {
      autoRenewal: true,
    });

    return {
      success: true,
    };
  }
}