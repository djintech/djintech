import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { PasswordRecoveryDto } from "../../dto/password-recovery.dto";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { UsersRepository } from "@src/modules/user-accounts/infrastructure/users.repository";
import { add } from "date-fns/add";
import { EmailExamples } from "@src/modules/notifications/email-examples";
import { UserRegisteredEvent } from "@src/modules/user-accounts/domain/events/user-registered.event";
import { PasswordRecoveryRepository } from "@src/modules/user-accounts/infrastructure/password-recovery.repository";
import { UuidService } from "@libs/utils/src/uuid/uuid.service";

export class PasswordRecoveryCommand {
  constructor(public dto: PasswordRecoveryDto) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private uuidService: UuidService,
    private eventBus: EventBus,
    private emailExamples: EmailExamples,
    private passwordRecoveryRepository: PasswordRecoveryRepository,
  ) {}

  async execute({ dto }: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail( dto.email );

    if ( !user ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: ''         
      })
    }

    const code = this.uuidService.generate();

    const existing = await this.passwordRecoveryRepository.findByUserId(user.id);

    if (existing) {
      await this.passwordRecoveryRepository.update(existing.id, {
        recoveryCode: code,
        recoveryCodeExpireDate: add(new Date(), { hours: 1 }),
        alreadyChangePassword: false,
      });
    } else {
      await this.passwordRecoveryRepository.create({
        recoveryCodeExpireDate: add(new Date(), { hours: 1 }),
        recoveryCode: code,
        user: { connect: { id: user.id } },
      });
    }

    this.eventBus.publish(new UserRegisteredEvent(user.email, code, this.emailExamples.passwordRecoveryEmail));
  }
}