import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { NotificationsGateway } from './infrastructure/notifications.gateway';
import { NotificationsController } from './api/notifications.controller';
import { SubscriptionConsumer } from './application/consumers/subscription-activated.consumer';
import { NotificationsRepository } from './infrastructure/notifications.repository';
import { NotificationsService } from './application/services/notifications.service';
import { NotificationsScheduler } from './application/schedulers/notifications.scheduler';
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
    ScheduleModule,
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [
    NotificationsController,
    SubscriptionConsumer,
  ],
  providers: [
    NotificationsGateway,
    NotificationsRepository,
    NotificationsService,
    NotificationsScheduler,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class NotificationsModule {}
