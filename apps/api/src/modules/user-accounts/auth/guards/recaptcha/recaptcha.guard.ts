import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GoogleRecaptchaService } from "../../application/services/recaptcha.service";

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(private readonly recaptcha: GoogleRecaptchaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.body.recaptcha;
    const ip = request.ip;

    if (!token) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recaptcha token missing',
        extensions: [{ message: 'Recaptcha is not valid', field: 'recaptcha'}]
      });
    }

    await this.recaptcha.verify(token, ip);

    return true;
  }
}