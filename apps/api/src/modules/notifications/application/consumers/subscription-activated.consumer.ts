import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_PAYMENT_REMINDER, EVENT_SUBSCRIPTION_ACTIVATED, EVENT_SUBSCRIPTION_EXPIRES_IN_1_DAY, EVENT_SUBSCRIPTION_EXPIRES_IN_7_DAYS } from '@libs/constants/rabbitmq';
import { NotificationsService } from '../services/notifications.service';
import { SubscriptionActivatedEvent, SubscriptionReminderEvent } from '@libs/contracts/payments/subscription.events';
import { NotificationsRepository } from '../../infrastructure/notifications.repository';
import { NotificationType } from '@src/generated/prisma/enums';

@Controller()
export class SubscriptionConsumer {
  private readonly logger = new Logger(SubscriptionConsumer.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

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

  @EventPattern(EVENT_PAYMENT_REMINDER)
  async paymentReminder(
    @Payload() event: SubscriptionReminderEvent,
  ) {
    await this.sendUniqueNotification(
      event.userId,
      NotificationType.PAYMENT_REMINDER,
      `Следующий платеж у вас спишется через 1 день`,
    );
  }

  @EventPattern(EVENT_SUBSCRIPTION_EXPIRES_IN_7_DAYS)
  async expiresIn7Days(
    @Payload() event: SubscriptionReminderEvent,
  ) {
    await this.sendUniqueNotification(
      event.userId,
      NotificationType.SUBSCRIPTION_EXPIRES_7_DAYS,
      `Ваша подписка истекает через 7 дней`,
    );
  }
  
  @EventPattern(EVENT_SUBSCRIPTION_EXPIRES_IN_1_DAY)
  async expiresIn1Day(
    @Payload() event: SubscriptionReminderEvent,
  ) {
    await this.sendUniqueNotification(
      event.userId,
      NotificationType.SUBSCRIPTION_EXPIRES_1_DAY,
      `Ваша подписка истекает через 1 день`,
    );
  }
  
  private async sendUniqueNotification(
    userId: number,
    type: NotificationType,
    message: string,
  ) {
    const { from, to } = this.getTodayUtcPeriod();

    const exists = await this.notificationsRepository.existsByTypeAndPeriod( userId, type, from, to, );

    if (exists) {
      return;
    }

    await this.notificationsService.createAndSend({ userId, type, message, notifyAt: new Date(), });
  }

  private getTodayUtcPeriod() {
    const now = new Date();
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    return { from, to };
  }
}
