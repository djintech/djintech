import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { EmailConfirmationRepository } from '../../../infrastructure/email-confirmation.repository';
import { add } from 'date-fns/add';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { UuidService } from '@libs/utils/src/uuid/uuid.service';
import { RegistrationEmailResendingInputDto } from '../../../api/input-dto/registration-email-resending.input-dto';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { EmailExamples } from '@src/modules/emails/email-examples';
import { UserRegisteredEvent } from '../../../domain/events/user-registered.event';

export class RegistrationEmailResendingCommand {
  constructor(public dto: RegistrationEmailResendingInputDto) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(
    private eventBus: EventBus,
    private usersRepository: UsersRepository,
    private uuidService: UuidService,
    private emailExamples: EmailExamples,
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute({ dto }: RegistrationEmailResendingCommand): Promise<void> {
    const existingUser = await this.usersRepository.findByEmail(dto.email);

    if (!existingUser) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with given email not found',
        extensions: [
          { message: 'User with given email not found', field: 'email' },
        ],
      });
    }

    const emailConfirmation =
      await this.emailConfirmationRepository.findByUserId(existingUser.id);

    if (emailConfirmation && existingUser.isConfirmed === true) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'email is already confirmed',
        extensions: [{ message: 'email is already confirmed', field: 'email' }],
      });
    }

    const newConfirmationCode = this.uuidService.generate();

    await this.emailConfirmationRepository.update(emailConfirmation!.id, {
      expirationDate: add(new Date(), { hours: 1 }),
      confirmationCode: newConfirmationCode,
    });

    this.eventBus.publish(
      new UserRegisteredEvent(
        existingUser.email,
        newConfirmationCode,
        this.emailExamples.registrationEmail,
      ),
    );
  }
}
