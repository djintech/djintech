import { GoogleRecaptchaService } from "@src/modules/user-accounts/application/services/recaptcha.service";

export class GoogleRecaptchaServiceMock extends GoogleRecaptchaService {
  //override method
  async verify(token: string, ip?: string): Promise<void> {
    console.log('Call mock method GoogleRecaptchaService');

    return Promise.resolve();
  }
}
