import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { SecurityDeviceContextDto } from '@src/modules/user-accounts/dto/security-device-context.dto';

export const ExtractDeviceFromRefresh = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SecurityDeviceContextDto => {
    const request = ctx.switchToHttp().getRequest();

    const securityContext = request.securityContext;
    if (!securityContext) {      
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'there is no securityContext in the request object!',
      });
    }

    return securityContext;
  },
);
