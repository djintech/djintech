import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MessageRepository } from '../../infrastructure/message.repository';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { Message, MessageStatus } from '@src/generated/prisma/browser';

export class UpdateMessageStatusCommand {
  constructor(
    public readonly userId: number,
    public readonly ids: number[],
  ) {}
}

@CommandHandler(UpdateMessageStatusCommand)
export class UpdateMessageStatusUseCase
  implements ICommandHandler<UpdateMessageStatusCommand, Message[]>
{
  constructor(private readonly messageRepository: MessageRepository,) {}

  async execute({ userId, ids }: UpdateMessageStatusCommand): Promise<Message[]> {
    const messages = await this.messageRepository.findByIds(ids);

    if (messages.length !== ids.length) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Message not found',
        extensions: [{ message: 'Message not found', field: 'message' }],
      });
    }

    for (const message of messages) {
      if (message.receiverId !== userId) {
        throw new DomainException({
          code: DomainExceptionCode.Forbidden,
          message: 'Forbidden. The user is not the receiver of the message.',
        });
      }
    }

    return this.messageRepository.updateStatuses( ids, userId, MessageStatus.READ );
  }
}
