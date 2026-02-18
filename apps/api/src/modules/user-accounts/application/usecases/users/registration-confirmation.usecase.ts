import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationConfirmationInputDto } from '../../../../user-accounts/api/input-dto/registration-confirmation.input-dto';
import { EmailConfirmationRepository } from '../../../infrastructure/email-confirmation.repository';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';

export class RegistrationConfirmationCommand {
  constructor(public dto: RegistrationConfirmationInputDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase implements ICommandHandler<RegistrationConfirmationCommand> {
  constructor(
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute({ dto }: RegistrationConfirmationCommand): Promise<void> {
    const emailConfirmation =
      await this.emailConfirmationRepository.findUserByConfirmationCode(
        dto.code,
      );
    if (
      !emailConfirmation ||
      emailConfirmation.isConfirmed === true ||
      emailConfirmation.confirmationCode !== dto.code ||
      (emailConfirmation.expirationDate &&
        emailConfirmation.expirationDate < new Date())
    ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Looks like the verification link has expired',
        extensions: [
          {
            message: 'Looks like the verification link has expired',
            field: 'code',
          },
        ],
      });
    }

    await this.emailConfirmationRepository.update(emailConfirmation.id, {
      isConfirmed: true,
    });
  }
}
