import { Injectable } from '@nestjs/common';
import { MessengerGateway } from '../../api/messenger.gateway';
import { MessageViewDto } from '../../api/view-dto/message.view-dto';
import { Message } from '@src/generated/prisma/client';

@Injectable()
export class MessengerService {
  constructor(
    private readonly messengerGateway: MessengerGateway,
  ) {}

  sendMessageUpdated(message: Message): void {
    const payload = MessageViewDto.mapToView(message);

    this.messengerGateway.sendMessageUpdated(
      message.ownerId,
      message.receiverId,
      payload,
    );
  }

  sendMessageDeleted(message: Message): void {
    this.messengerGateway.sendMessageDeleted(
      message.ownerId,
      message.receiverId,
      {
        id: message.id,
      },
    );
  }
}
