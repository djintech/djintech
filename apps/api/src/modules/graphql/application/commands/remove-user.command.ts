import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';

export class RemoveUserCommand {
  constructor(
    public readonly userId: number,
  ) {}
}

@CommandHandler(RemoveUserCommand)
export class RemoveUserCommandHandler
  implements ICommandHandler<RemoveUserCommand, boolean>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ userId }: RemoveUserCommand): Promise<boolean> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    await this.usersRepository.update(userId, {
      deletedAt: new Date(),
    },);

    return true;
  }
}
