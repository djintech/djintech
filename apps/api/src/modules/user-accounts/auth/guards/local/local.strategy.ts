import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserContextDto } from '../../dto/user-context.dto';
import { AuthService } from '../../application/services/auth.service';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  //validate возвращает то, что впоследствии будет записано в req.user
  async validate(email: string, password: string): Promise<UserContextDto> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid email or password',
      });
    }

    if (password === '') {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid email or password',
        extensions: [{ message: 'recommended recovery password', field: 'password'}]
      });
    }

    return user;
  }
}
