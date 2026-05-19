import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionsRepository } from '../../infrastructure/subscriptions.repository';
import { PaymentFactory } from '../../infrastructure/payment.factory';

export class CancelAutoRenewalCommand {
  constructor(public readonly userId: number) {}
}

@Injectable()
@CommandHandler(CancelAutoRenewalCommand)
export class CancelAutoRenewalUseCase
  implements ICommandHandler<CancelAutoRenewalCommand>
{
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly paymentFactory: PaymentFactory,
  ) {}

  async execute({ userId }: CancelAutoRenewalCommand) {
    const subscription = await this.subscriptionsRepository.findActiveOrPendingByUserId( userId );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (!subscription.providerSubscriptionId) {
      throw new BadRequestException('Provider subscription id missing');
    }

    if (!subscription.autoRenewal) {
      return { success: true };
    }

    const provider = this.paymentFactory.get( subscription.paymentType );

    await provider.cancelAutoRenewal( subscription.providerSubscriptionId );

    await this.subscriptionsRepository.update(subscription.id, {
      autoRenewal: false,
    });

    return {
      success: true,
    };
  }
}
