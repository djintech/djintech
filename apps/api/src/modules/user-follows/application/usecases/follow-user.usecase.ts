import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserFollowRepository } from "../../infrastructure/user-follow.repository";

export class FollowUserCommand {
  constructor(
    public readonly userId: number,
    public readonly selectedUserId: number,
  ) {}
}

@CommandHandler(FollowUserCommand)
export class FollowUserUseCase
  implements ICommandHandler<FollowUserCommand>
{
  constructor( 
    private userFollowRepository: UserFollowRepository,
  ) {}

  async execute({ userId, selectedUserId }: FollowUserCommand): Promise<void> {
    if (userId === selectedUserId) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Cannot follow yourself`,
        extensions: [{ message: `Cannot follow yourself`, field: 'selectedUserId'}],
      })
    }

    const userExists = await this.userFollowRepository.userExists(selectedUserId);

    if (!userExists) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        extensions: [{ message: 'User not found', field: 'selectedUserId' }],
      });
    }

    const alreadyFollowing = await this.userFollowRepository.isFollowing( userId, selectedUserId );

    if (alreadyFollowing) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User is already followed',
        extensions: [{ message: 'User is already followed', field: 'selectedUserId' }],
      });
    }

    return this.userFollowRepository.followUser( userId, selectedUserId );    
  }
}
 