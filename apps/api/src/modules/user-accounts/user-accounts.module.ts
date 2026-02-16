import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { AuthController } from "./api/auth.controller";
import { RegisterUserUseCase } from "./application/usecases/users/register-user.usecase";
import { NotificationsModule } from "../notifications/notifications.module";
import { UsersRepository } from "./infrastructure/users.repository";
import { CryptoService } from "./application/services/crypto.service";
import { UuidService } from "./application/services/uuid.service";
import { EmailService } from "../notifications/email.service";
import { EmailExamples } from "../notifications/email-examples";
import { UsersFactory } from "./application/factories/users.factory";
import { EmailConfirmationFactory } from "./application/factories/email-confirmation.factory";
import { EmailConfirmationRepository } from "./infrastructure/email-confirmation.repository";
import { RegistrationConfirmationUseCase } from "./application/usecases/users/registration-confirmation.usecase";
import { RegistrationEmailResendingUseCase } from "./application/usecases/users/registration-email-resending.usecase";

const commandHandlers = [
  RegisterUserUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
];

const queryHandlers = [

];

@Module({
  imports: [
    CqrsModule,
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [    
    ...commandHandlers,
    ...queryHandlers,
     UsersRepository,
    // {
    //   provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
    //   useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
    //     return new JwtService({
    //       secret: userAccountConfig.accessTokenSecret,
    //       signOptions: { expiresIn: userAccountConfig.accessTokenExpireIn },
    //     });
    //   },
    //   inject: [UserAccountsConfig],
    // },
    // {
    //   provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
    //   useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
    //     return new JwtService({
    //       secret: userAccountConfig.refreshTokenSecret,
    //       signOptions: { expiresIn: userAccountConfig.refreshTokenExpireIn },
    //     });
    //   },
    //   inject: [UserAccountsConfig],
    // },

    // UsersQueryRepository,
    CryptoService,
    UuidService,
    EmailService,
    EmailExamples,
    UsersFactory,    
    EmailConfirmationFactory,
    EmailConfirmationRepository,

  ],
  exports: [],
})

export class UserAccountsModule {}