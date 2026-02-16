import { Injectable } from "@nestjs/common"


@Injectable()
export class EmailExamples {
  registrationEmail(code: string) {
      return ` <h1>Thank for your registration</h1>
             <p>To finish registration please follow the link below:<br>
                <a href='https://djintech.org/sign-up/confirm-success?code=${code}'>complete registration</a>
            </p>`
  }

  passwordRecoveryEmail(code: string) {
      return `  <h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://djintech.org/password-recovery?recoveryCode=${code}'>recovery password</a>
      </p>`
  }
}
