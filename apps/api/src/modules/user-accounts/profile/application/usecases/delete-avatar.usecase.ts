import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AvatarsRepository } from "../../infrastructure/avatars.repository";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";

export class DeleteAvatarCommand {
  constructor(
    public userId: number
  ) {}
}

@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarUseCase
  implements ICommandHandler<DeleteAvatarCommand, void>
{
  constructor( private avatarsRepository: AvatarsRepository, ){
  }

  async execute({ userId }: DeleteAvatarCommand): Promise<void> {
    const avatar = await this.avatarsRepository.findByUserId( userId );

    if ( !avatar ){
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Avatar not found',
        extensions: [{ message: 'Avatar not found', field: 'avatar' }],
      });      
    }

    await this.avatarsRepository.softDelete( avatar.id );
    return;
  }
}