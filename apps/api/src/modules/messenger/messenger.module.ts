import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { MessageQueryRepository } from './infrastructure/query/message.query.repository';
import { MessengerGateway } from './api/messenger.gateway';

const commandHandlers = [
  //MarkAsReadUseCase
];

const queryHandlers = [
  //GetNotificationsHandler,
];

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [
    //NotificationsController,
    //SubscriptionConsumer,
  ],
  providers: [
    MessengerGateway,
    MessageQueryRepository,
    // NotificationsService,
    // NotificationsScheduler,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class MessengerModule {}
