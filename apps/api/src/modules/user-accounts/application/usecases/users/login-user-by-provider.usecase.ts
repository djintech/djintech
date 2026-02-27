import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserProviderContextDto } from '@src/modules/user-accounts/dto/user-provider-context.dto';
import { UserProvidersRepository } from '@src/modules/user-accounts/infrastructure/user-providers.repository';
import { ProviderType } from '@src/generated/prisma/enums';
import { RequestMetadataDto } from '@src/modules/user-accounts/dto/request-metadata.dto';
import { LoginUserCommand } from './login-user.usecase';
import { User } from '@src/generated/prisma/client';
import { UsersRepository } from '@src/modules/user-accounts/infrastructure/users.repository';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { UsersFactory } from '../../factories/users.factory';
import { UuidService } from '../../services/uuid.service';
import { UserRegisteredEvent } from '@src/modules/user-accounts/domain/events/user-registered.event';
import { EmailExamples } from '@src/modules/notifications/email-examples';

export class LoginUserByProviderCommand {
  constructor(
    public userProvider: UserProviderContextDto, 
    public providerType: ProviderType,
    public metadata: RequestMetadataDto 
  ) {}
}

@CommandHandler(LoginUserByProviderCommand)
export class LoginUserByProviderUseCase implements ICommandHandler<LoginUserByProviderCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userProvidersRepository: UserProvidersRepository,
    private readonly usersRepository: UsersRepository,
    private usersFactory: UsersFactory,
    private readonly uuidService: UuidService,
    private eventBus: EventBus,
    private emailExamples: EmailExamples,
  ) {}

  async execute({ userProvider, providerType, metadata }: LoginUserByProviderCommand): Promise<{ accessToken: string; refreshToken: string }> {
    let user: User | null;

    const provider = await this.userProvidersRepository.findByProviderId( providerType, userProvider.providerId );
    if ( provider ) {
      user = await this.usersRepository.findById( provider.userId );
      if ( provider.providerEmail !== userProvider.providerEmail ) {
        await this.userProvidersRepository.update( provider.id, { providerEmail: userProvider.providerEmail})
      }
    } else {
      user = await this.usersRepository.findByEmail( userProvider.providerEmail );
      if ( !user ) {
        const username = userProvider.providerName || 'client' + this.uuidService.generate();//.replace(/-/g, '').slice(0, 30);
        const newUser = await this.usersFactory.create({
          email: userProvider.providerEmail,
          username,
          isConfirmed: true
        });
        
        user = await this.usersRepository.create(newUser);
        this.eventBus.publish(new UserRegisteredEvent(user.email, providerType, this.emailExamples.registrationEmailByProvider));
      }
      await this.userProvidersRepository.create({
        user: { connect: { id: user.id } },
        provider: providerType,
        providerId: userProvider.providerId,
        providerEmail: userProvider.providerEmail
      });
    }
    
     if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'there is no user',
        extensions: [{ message: 'there is no user', field: 'user' }],
      });
    }    
        
    return await this.commandBus.execute< LoginUserCommand, { accessToken: string; refreshToken: string }>
      ( new LoginUserCommand({ userId: user.id.toString(), metadata }) );
  }
}
