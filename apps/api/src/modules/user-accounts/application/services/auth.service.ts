import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../../dto/user-context.dto';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { EmailConfirmationRepository } from '../../infrastructure/email-confirmation.repository';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private emailConfirmationRepository: EmailConfirmationRepository,
    private cryptoService: CryptoService,
  ) {}
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    const emailConfirmation =
      await this.emailConfirmationRepository.findByUserId(user.id);
    if (emailConfirmation && !emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash || '',
    });

    if (!isPasswordValid) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    return { id: user.id!.toString() };
  }
}
