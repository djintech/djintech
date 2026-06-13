import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_SUBSCRIPTION_EXPIRED } from '@libs/constants';
import { ProfilesRepository } from '@src/modules/user-accounts/profile/infrastructure/profiles.repository';
import { AccountType } from '@src/generated/prisma/enums';
import { SubscriptionExpiredEvent } from '@libs/contracts/payments/subscription.events';

@Controller()
export class SubscriptionExpiredConsumer {
  private readonly logger = new Logger(SubscriptionExpiredConsumer.name);

  constructor(private readonly profilesRepository: ProfilesRepository) {}

  @EventPattern(EVENT_SUBSCRIPTION_EXPIRED)
  async handle(@Payload() event: SubscriptionExpiredEvent): Promise<void> {
    this.logger.log(`Received subscription.expired for userId=${event.userId}`);
    await this.profilesRepository.update(event.userId, {
      accountType: AccountType.Personal,
    });
  }
}
