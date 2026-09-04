import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MessageRepository } from '../../infrastructure/message.repository';
import { MessageStatus } from '@src/generated/prisma/browser';
import { MessageViewDto } from '../../api/view-dto/message.view-dto';

export class MarkMessageReceivedCommand {
  constructor(
    public readonly messageId: number,
    public readonly receiverId: number,
  ) {}
}

@CommandHandler(MarkMessageReceivedCommand)
export class MarkMessageReceivedCommandHandler
  implements ICommandHandler<MarkMessageReceivedCommand, MessageViewDto | null>
{
  constructor(
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute({ messageId, receiverId }: MarkMessageReceivedCommand): Promise<MessageViewDto | null> {
   const message = await this.messageRepository.findById( messageId );

    if (!message) {
      return null;
    }

    // Важно: только настоящий receiver может подтвердить доставку.
    if (message.receiverId !== receiverId) {
      return null;
    }

    if (message.status !== MessageStatus.SENT) {
      return MessageViewDto.mapToView(message);
    }

    const updatedMessage = await this.messageRepository.updateStatus( message.id, MessageStatus.RECEIVED );
    return MessageViewDto.mapToView(updatedMessage);
  }
}
