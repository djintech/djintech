import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { UsersFactory } from '../../factories/users.factory';
import { EmailConfirmationFactory } from '../../factories/email-confirmation.factory';
import { UserRegisteredEvent } from '../../../domain/events/user-registered.event';
import { EmailConfirmationRepository } from '../../../infrastructure/email-confirmation.repository';
import { add } from 'date-fns/add';
import { EmailExamples } from '@src/modules/emails/email-examples';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { UuidService } from '@libs/utils/src/uuid/uuid.service';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private eventBus: EventBus,
    private usersRepository: UsersRepository,
    private usersFactory: UsersFactory,
    private uuidService: UuidService,
    private emailExamples: EmailExamples,
    private emailConfirmationFactory: EmailConfirmationFactory,
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const existingUser = await this.usersRepository.findByUsernameOrEmail(
      dto.username,
      dto.email,
    );
    const confirmationCode = this.uuidService.generate();
    let savedUser;

    if (existingUser) {
      const emailConfirmation =
        await this.emailConfirmationRepository.findByUserId(existingUser.id);

      if (emailConfirmation && !existingUser.isConfirmed) {
        const user = await this.usersFactory.update(dto);
        savedUser = await this.usersRepository.update(existingUser.id, user);

        await this.emailConfirmationRepository.update(emailConfirmation.id, {
          expirationDate: add(new Date(), { hours: 1 }),
          confirmationCode,
        });
      } else {
        if (existingUser.email === dto.email) {
          throw new DomainException({
            code: DomainExceptionCode.BadRequest,
            message: 'User with this email is already registered',
            extensions: [
              {
                message: 'User with this email is already registered',
                field: 'email',
              },
            ],
          });
        } else {
          throw new DomainException({
            code: DomainExceptionCode.BadRequest,
            message: 'User with this username is already registered',
            extensions: [
              {
                message: 'User with this username is already registered',
                field: 'username',
              },
            ],
          });
        }
      }
    } else {
      const user = await this.usersFactory.create(dto);
      savedUser = await this.usersRepository.create(user);
      const emailConfirmationToSave = this.emailConfirmationFactory.create({
        userId: savedUser.id,
        expirationDate: add(new Date(), { hours: 1 }),
        confirmationCode,
      });
      await this.emailConfirmationRepository.create(emailConfirmationToSave);
    }

    this.eventBus.publish(
      new UserRegisteredEvent(
        savedUser.email,
        confirmationCode,
        this.emailExamples.registrationEmail,
      ),
    );
  }
}
