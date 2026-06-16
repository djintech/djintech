import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_SUBSCRIPTION_ACTIVATED } from '@libs/constants/rabbitmq';
import { NotificationsGateway } from '../../infrastructure/notifications.gateway';
import { SubscriptionActivatedEvent } from '@libs/contracts/payments/subscription.events';

@Controller()
export class SubscriptionActivatedConsumer {
  private readonly logger = new Logger(SubscriptionActivatedConsumer.name);

  constructor(private readonly gateway: NotificationsGateway) {}

  @EventPattern(EVENT_SUBSCRIPTION_ACTIVATED)
  async handle(@Payload() event: SubscriptionActivatedEvent): Promise<void> {
    this.logger.log(`WS notify userId=${event.userId} subscription.activated`);
    this.gateway.sendNotification(event.userId, { 
    type: 'SUBSCRIPTION_ACTIVATED',
    expireAt: event.expireAt,
    message: `Ваша подписка активирована и действует до ${event.expireAt}`,
  });
  }
}
