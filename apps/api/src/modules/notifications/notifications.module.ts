import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { NotificationsGateway } from './infrastructure/notifications.gateway';
import { NotificationsController } from './api/notifications.controller';
import { SubscriptionActivatedConsumer } from './application/consumers/subscription-activated.consumer';
import { NotificationsRepository } from './infrastructure/notifications.repository';
import { NotificationsService } from './application/services/notifications.service';
import { GetNotificationsHandler } from './application/queries/get-notifications.query';
import { MarkAsReadUseCase } from './application/usecases/mark-as-read.usecase';
import { DeleteNotificationUseCase } from './application/usecases/delete-notification.usecase';

const commandHandlers = [
  MarkAsReadUseCase,
  DeleteNotificationUseCase,
];

const queryHandlers = [
  GetNotificationsHandler,
];

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [
    NotificationsController,
    SubscriptionActivatedConsumer,
  ],
  providers: [
    NotificationsGateway,
    NotificationsRepository,
    NotificationsService,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class NotificationsModule {}
