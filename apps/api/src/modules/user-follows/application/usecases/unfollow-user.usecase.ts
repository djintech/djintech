import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserFollowRepository } from "../../infrastructure/user-follow.repository";

export class UnfollowUserCommand {
  constructor(
    public readonly userId: number,
    public readonly selectedUserId: number,
  ) {}
}

@CommandHandler(UnfollowUserCommand)
export class UnfollowUserUseCase
  implements ICommandHandler<UnfollowUserCommand>
{
  constructor( 
    private userFollowRepository: UserFollowRepository,
  ) {}

  async execute({ userId, selectedUserId }: UnfollowUserCommand): Promise<void> {
    const isFollowing = await this.userFollowRepository.isFollowing( userId, selectedUserId );

    if (!isFollowing) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User is not followed',
        extensions: [{ message: 'User is not followed', field: 'selectedUserId' }],
      });
    }

    return this.userFollowRepository.unfollowUser( userId, selectedUserId );    
  }
}
 