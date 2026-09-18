import { Injectable } from '@nestjs/common';
import { MessengerGateway } from '../../api/messenger.gateway';
import { MessageViewDto } from '../../api/view-dto/message.view-dto';
import { Message } from '@src/generated/prisma/client';
import { FileUrlService } from '@src/core/file/file-url.service';
import { MessageWithMedia } from '../../infrastructure/types/message-with-media.type';

@Injectable()
export class MessengerService {
  constructor(
    private readonly messengerGateway: MessengerGateway,
    private readonly fileUrlService: FileUrlService,
  ) {}

  sendMessageUpdated(message: MessageWithMedia): void {
    const payload = MessageViewDto.mapToView(message, this.fileUrlService);

    this.messengerGateway.sendMessageUpdated(
      message.ownerId,
      message.receiverId,
      payload,
    );
  }

  sendMessage(message: MessageViewDto): void {
  this.messengerGateway.sendMessage(
    message.ownerId,
    message.receiverId,
    message,
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
