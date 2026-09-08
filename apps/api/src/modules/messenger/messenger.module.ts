import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { MessageQueryRepository } from './infrastructure/query/message.query.repository';
import { MessengerGateway } from './api/messenger.gateway';
import { MessageRepository } from './infrastructure/message.repository';
import { UsersRepository } from './infrastructure/users.repository';
import { SendMessageCommandHandler } from './application/usecases/send-message.usecase';
import { MarkMessageReceivedCommandHandler } from './application/usecases/mark-message-received.usecase';
import { GetMessagesHandler } from './application/queries/get-messages.query';
import { GetDialogueByIdHandler } from './application/queries/get-dialogue-by-id.query';
import { MessengerController } from './api/messenger.controller';

const commandHandlers = [
  SendMessageCommandHandler,
  MarkMessageReceivedCommandHandler,
];

const queryHandlers = [
  GetMessagesHandler,
  GetDialogueByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [
    MessengerController,
    //SubscriptionConsumer,
  ],
  providers: [
    MessengerGateway,
    MessageQueryRepository,
    MessageRepository,
    UsersRepository,
    // NotificationsService,
    // NotificationsScheduler,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class MessengerModule {}
