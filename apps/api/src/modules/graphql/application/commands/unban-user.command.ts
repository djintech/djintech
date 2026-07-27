import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';

export class UnbanUserCommand {
  constructor(
    public readonly userId: number,
  ) {}
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserCommandHandler
  implements ICommandHandler<UnbanUserCommand, boolean>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ userId }: UnbanUserCommand): Promise<boolean> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    await this.usersRepository.update(userId, {
      isBanned: false,
      banReason: null,
      banDate: null,
    },);

    return true;
  }
}
