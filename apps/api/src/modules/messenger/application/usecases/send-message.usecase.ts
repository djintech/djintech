import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MessageRepository } from '../../infrastructure/message.repository';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';
import { MessageViewDto } from '../../api/view-dto/message.view-dto';

export class SendMessageCommand {
  constructor(
    public readonly ownerId: number,
    public readonly receiverId: number,
    public readonly message: string,
  ) {}
}

@CommandHandler(SendMessageCommand)
export class SendMessageCommandHandler
  implements ICommandHandler<SendMessageCommand, MessageViewDto>
{
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly usersRepository: UsersRepository, 
  ) {}

  async execute({ ownerId, receiverId, message }: SendMessageCommand): Promise<MessageViewDto> {
    message = message.trim();

    if (!message) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Message cannot be empty',
        extensions: [{ message: 'Message cannot be empty', field: 'message' }],
      });
    }

    if (ownerId === receiverId) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Cannot send message to yourself',
        extensions: [{ message: 'Cannot send message to yourself', field: 'receiverId' }],
      });
    }

    const receiver = await this.usersRepository.findUnique(receiverId);

    if (!receiver) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Receiver not found',
        extensions: [{ message: 'Receiver not found', field: 'receiverId' }],
      });
    }

    const createdMessage = await this.messageRepository.createMessage({
      ownerId: ownerId,
      receiverId: receiverId,
      messageText: message,
    });

    return MessageViewDto.mapToView(createdMessage);
  }
}
