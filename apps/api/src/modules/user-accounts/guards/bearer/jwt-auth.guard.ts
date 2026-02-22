import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }
    return user;
  }
}
