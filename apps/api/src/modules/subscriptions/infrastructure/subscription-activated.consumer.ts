import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_SUBSCRIPTION_ACTIVATED } from '@libs/constants';
import { SubscriptionActivatedEvent } from '@libs/contracts/payments/subscription.events';
import { ProfilesRepository } from '@src/modules/user-accounts/profile/infrastructure/profiles.repository';
import { AccountType } from '@src/generated/prisma/enums';

@Controller()
export class SubscriptionActivatedConsumer {
  private readonly logger = new Logger(SubscriptionActivatedConsumer.name);

  constructor(private readonly profilesRepository: ProfilesRepository) {}

  @EventPattern(EVENT_SUBSCRIPTION_ACTIVATED)
  async handle(@Payload() event: SubscriptionActivatedEvent): Promise<void> {
    this.logger.log(`Received subscription.activated for userId=${event.userId}`);
    await this.profilesRepository.update(event.userId, {
      accountType: AccountType.Business,
    });
  }
}
