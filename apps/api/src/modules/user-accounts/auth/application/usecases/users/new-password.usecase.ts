import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NewPasswordDto } from "../../dto/new-password.dto";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { CryptoService } from "../../services/crypto.service";
import { UsersRepository } from "@src/modules/user-accounts/auth/infrastructure/users.repository";
import { PasswordRecoveryRepository } from "@src/modules/user-accounts/auth/infrastructure/password-recovery.repository";

export class NewPasswordCommand {
  constructor(public dto: NewPasswordDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase
  implements ICommandHandler<NewPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
    private passwordRecoveryRepository: PasswordRecoveryRepository,
  ) {}

  async execute({ dto }: NewPasswordCommand): Promise<void> {
    const { newPassword, recoveryCode } = dto;
    
    const passwordRecovery = await this.passwordRecoveryRepository.findByRecoveryCode( recoveryCode );
    if ( passwordRecovery && passwordRecovery.alreadyChangePassword ) return;

    if ( !passwordRecovery 
      || (passwordRecovery.recoveryCodeExpireDate && passwordRecovery.recoveryCodeExpireDate < new Date())
    ){
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Password recovery code is invalid',
        extensions: [{ message: 'Password recovery code is invalid', field: 'recoveryCode' }],
      });      
    }

    await this.passwordRecoveryRepository.update(passwordRecovery.id, {
      alreadyChangePassword: true,
    });
    const passwordHash = await this.cryptoService.createPasswordHash( newPassword );
    await this.usersRepository.updatePasswordHash( passwordHash, passwordRecovery.userId );
  }
}
