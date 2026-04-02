import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserProviderContextDto } from '@src/modules/user-accounts/auth/dto/user-provider-context.dto';

export const ExtractUserFromProviderRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserProviderContextDto => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'there is no user in the request object!',
        extensions: [{ message: 'there is no user in the request object!', field: 'user' }],
      });
    }

    return user;
  },
);
