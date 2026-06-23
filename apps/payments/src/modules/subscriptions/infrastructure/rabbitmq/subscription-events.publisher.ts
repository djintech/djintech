import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EVENT_PAYMENT_REMINDER, EVENT_SUBSCRIPTION_ACTIVATED, EVENT_SUBSCRIPTION_EXPIRED, EVENT_SUBSCRIPTION_EXPIRES_IN_1_DAY, EVENT_SUBSCRIPTION_EXPIRES_IN_7_DAYS } from '@libs/constants';
import { SubscriptionActivatedEvent, SubscriptionExpiredEvent, SubscriptionReminderEvent } from '@libs/contracts/payments/subscription.events';

export const RABBITMQ_CLIENT = 'RABBITMQ_CLIENT';

@Injectable()
export class SubscriptionEventsPublisher {
  private readonly logger = new Logger(SubscriptionEventsPublisher.name);

  constructor(
    @Inject(RABBITMQ_CLIENT) private readonly client: ClientProxy,
  ) {}

  publishSubscriptionActivated(event: SubscriptionActivatedEvent): void {
    this.logger.log(`Publishing ${EVENT_SUBSCRIPTION_ACTIVATED} for userId=${event.userId}`);
    this.client.emit(EVENT_SUBSCRIPTION_ACTIVATED, event);
  }

  publishSubscriptionExpired(event: SubscriptionExpiredEvent): void {
    this.logger.log(`Publishing ${EVENT_SUBSCRIPTION_EXPIRED} for userId=${event.userId}`);
    this.client.emit(EVENT_SUBSCRIPTION_EXPIRED, event);
  }

  publishSubscriptionExpiresIn7Days(event: SubscriptionReminderEvent): void {
    this.logger.log(`Publishing ${EVENT_SUBSCRIPTION_EXPIRES_IN_7_DAYS} for userId=${event.userId}`);
    this.client.emit(EVENT_SUBSCRIPTION_EXPIRES_IN_7_DAYS, event);
  }

  publishSubscriptionExpiresIn1Day(event: SubscriptionReminderEvent): void {
    this.logger.log(`Publishing ${EVENT_SUBSCRIPTION_EXPIRES_IN_1_DAY} for userId=${event.userId}`);
    this.client.emit(EVENT_SUBSCRIPTION_EXPIRES_IN_1_DAY, event);
  }

  publishPaymentReminder(event: SubscriptionReminderEvent): void {
    this.logger.log(`Publishing ${EVENT_PAYMENT_REMINDER} for userId=${event.userId}`);
    this.client.emit(EVENT_PAYMENT_REMINDER, event);
  }
}
