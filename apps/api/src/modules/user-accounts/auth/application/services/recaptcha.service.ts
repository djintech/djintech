import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { UserAccountsConfig } from "../../config/user-accounts.config";

@Injectable()
export class GoogleRecaptchaService {
  constructor(
    private readonly http: HttpService,
    private readonly config: UserAccountsConfig,
  ) {}

  async verify(token: string, ip?: string): Promise<void> {
    const response = await this.http.axiosRef.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: this.config.recaptchaSecret,
          response: token,
          remoteip: ip,
        },
      },
    );

    const data = response.data;

    if ( !data.success || data.score < 0.5 ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recaptcha token missing',
        extensions: [{ message: 'Recaptcha is not valid', field: 'recaptcha'}]
      });
    }
  }
}
