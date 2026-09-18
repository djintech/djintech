import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MessageRepository } from '../../infrastructure/message.repository';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { FilesClientService } from '@src/modules/files/infrastructure/files.client';
import { MessageWithMedia } from '../../infrastructure/types/message-with-media.type';

export class DeleteMessageCommand {
  constructor(
    public readonly messageId: number,
    public readonly userId: number,
  ) {}
}

@CommandHandler(DeleteMessageCommand)
export class DeleteMessageUseCase
  implements ICommandHandler<DeleteMessageCommand, MessageWithMedia>
{
  constructor(
    private readonly messageRepository: MessageRepository, 
    private readonly filesClient: FilesClientService,
  ) {}

  async execute({ messageId, userId }: DeleteMessageCommand): Promise<MessageWithMedia> {
    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Message not found',
        extensions: [{ message: 'Message not found', field: 'message' }],
      });
    }

    if (message.ownerId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden. The user is not the owner of the message.',
      });
    }

    const mediaKey = message.media?.key ?? null;

    const deletedMessage = await this.messageRepository.delete(messageId);

    if (mediaKey) {
      try {
        await this.filesClient.delete([mediaKey]);
      } catch {
        //Здесь желательно добавить Logger.
      }
    }

    return deletedMessage;
  }
}
