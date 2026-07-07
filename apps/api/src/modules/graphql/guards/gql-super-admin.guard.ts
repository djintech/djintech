import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from "@src/modules/user-accounts/auth/constants/auth-tokens.inject-constants";
import { ADMIN_ROLE } from "../constants/super-admin.constants";

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(
      @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
      private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const auth = request.headers.authorization;

    if (!auth || !auth?.startsWith('Bearer ')) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    const token = auth.substring(7);

    let payload;

    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    if (payload.role !== ADMIN_ROLE) {
      throw new DomainException({
          code: DomainExceptionCode.Forbidden,
          message: 'Forbidden',
      });
    }

    request.user = payload;
    return true;
  }
}
