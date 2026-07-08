import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ROLE } from "../../constants/super-admin.constants";
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from "@src/modules/user-accounts/auth/constants/auth-tokens.inject-constants";
import { LoginPayload } from "../../dto/login.payload";

@Injectable()
export class AdminAuthService {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
      private accessTokenContext: JwtService,
  ) {}

  login(email: string, password: string): LoginPayload {
    if (
      email !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    return {
      accessToken: this.accessTokenContext.sign({
        role: ADMIN_ROLE,
        email: ADMIN_EMAIL,
      }),
    };
  }
}
