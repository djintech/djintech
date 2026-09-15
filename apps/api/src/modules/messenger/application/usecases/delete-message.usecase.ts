import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MessageRepository } from '../../infrastructure/message.repository';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { Message } from '@src/generated/prisma/client';

export class DeleteMessageCommand {
  constructor(
    public readonly messageId: number,
    public readonly userId: number,
  ) {}
}

@CommandHandler(DeleteMessageCommand)
export class DeleteMessageUseCase
  implements ICommandHandler<DeleteMessageCommand, Message>
{
  constructor(
    private readonly messageRepository: MessageRepository, 
  ) {}

  async execute({ messageId, userId }: DeleteMessageCommand): Promise<Message> {
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

    return this.messageRepository.delete(messageId);
  }
}
