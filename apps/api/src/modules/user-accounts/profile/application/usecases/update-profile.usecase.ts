import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserDto } from "../dto/create-profile.dto";
import { ProfilesRepository } from "../../infrastructure/profiles.repository";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { UsersRepository } from "@src/modules/user-accounts/auth/infrastructure/users.repository";
import { PrismaService } from "@src/db/prisma.service";
import { ObjectCleaner } from "../services/object-cleaner.service";

export class UpdateProfileCommand {
  constructor(
    public readonly userId: number,
    public readonly dto: CreateUserDto,
  ) {}
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileUseCase
  implements ICommandHandler< UpdateProfileCommand >
{
  constructor(
    private profilesRepository: ProfilesRepository,
    private usersRepository: UsersRepository,
    private prisma: PrismaService,
    private objectCleaner: ObjectCleaner,
  ) {}

  async execute({ userId, dto }: UpdateProfileCommand): Promise<void> {
    const user = await this.usersRepository.findById( userId );

    if ( !user ) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        extensions: [{ message: 'User not found', field: 'userId'}],
      })
    }

    const profileUpdate = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: dto.dateOfBirth,
      aboutMe: dto.aboutMe,
      country: dto.country,
      city: dto.city,
    };

    this.objectCleaner.cleanFromUndefined(profileUpdate);

    await this.prisma.$transaction(async (tx) => {
      if (Object.keys(profileUpdate).length > 0) {
        await this.profilesRepository.updateTx( tx, userId, profileUpdate );
      }
      
      if ( user.username !== undefined && user.username !== dto.userName){
        await this.usersRepository.updateTx( tx, userId, { username: dto.userName });
      }
    });
  }
}
 