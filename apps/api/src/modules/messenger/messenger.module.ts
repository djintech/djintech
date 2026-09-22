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
import { DeleteMessageUseCase } from './application/usecases/delete-message.usecase';
import { UpdateMessageStatusUseCase } from './application/usecases/update-message-status.usecase';
import { MessengerService } from './application/services/messenger.service';
import { CreateImageMessageUseCase } from './application/usecases/create-image-message.usecase';
import { CreateVoiceMessageUseCase } from './application/usecases/create-voice-message.usecase';

const commandHandlers = [
  SendMessageCommandHandler,
  MarkMessageReceivedCommandHandler,
  DeleteMessageUseCase,
  UpdateMessageStatusUseCase,
  CreateImageMessageUseCase,
  CreateVoiceMessageUseCase,
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
  ],
  providers: [
    MessengerGateway,
    MessageQueryRepository,
    MessageRepository,
    UsersRepository,
    MessengerService,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class MessengerModule {}
