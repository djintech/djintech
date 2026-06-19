import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_SUBSCRIPTION_ACTIVATED } from '@libs/constants/rabbitmq';
import { NotificationsService } from '../services/notifications.service';
import { SubscriptionActivatedEvent } from '@libs/contracts/payments/subscription.events';

@Controller()
export class SubscriptionActivatedConsumer {
  private readonly logger = new Logger(SubscriptionActivatedConsumer.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(EVENT_SUBSCRIPTION_ACTIVATED)
  async handle(@Payload() event: SubscriptionActivatedEvent): Promise<void> {
    this.logger.log(`WS notify userId=${event.userId} subscription.activated`);

    await this.notificationsService.createAndSend({
      userId: event.userId,
      type: 'SUBSCRIPTION_ACTIVATED',
      message: `Ваша подписка активирована и действует до ${event.expireAt}`,
      notifyAt: new Date(),
    });
  }
}
