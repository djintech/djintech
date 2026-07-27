import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@src/db/prisma.service';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';

export class BanUserCommand {
  constructor(
    public readonly userId: number,
    public readonly banReason: string,
  ) {}
}

@CommandHandler(BanUserCommand)
export class BanUserCommandHandler
  implements ICommandHandler<BanUserCommand, boolean>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ userId, banReason }: BanUserCommand): Promise<boolean> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    await this.usersRepository.update(userId, {
      isBanned: true,
      banReason,
      banDate: new Date(),
    },);

    return true;
  }
}
