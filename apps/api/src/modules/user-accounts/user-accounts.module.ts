import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './api/auth.controller';
import { RegisterUserUseCase } from './application/usecases/users/register-user.usecase';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersRepository } from './infrastructure/users.repository';
import { CryptoService } from './application/services/crypto.service';
import { UuidService } from './application/services/uuid.service';
import { EmailService } from '../notifications/email.service';
import { EmailExamples } from '../notifications/email-examples';
import { UsersFactory } from './application/factories/users.factory';
import { EmailConfirmationFactory } from './application/factories/email-confirmation.factory';
import { EmailConfirmationRepository } from './infrastructure/email-confirmation.repository';
import { RegistrationConfirmationUseCase } from './application/usecases/users/registration-confirmation.usecase';
import { RegistrationEmailResendingUseCase } from './application/usecases/users/registration-email-resending.usecase';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthService } from './application/services/auth.service';
import { LoginUserUseCase } from './application/usecases/users/login-user.usecase';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserAccountsConfig } from './config/user-accounts.config';
import type { StringValue } from 'ms';
import { NewPasswordUseCase } from './application/usecases/users/new-password.usecase';
import { GoogleRecaptchaService } from './application/services/recaptcha.service';
import { PasswordRecoveryUseCase } from './application/usecases/users/password-recovery.usecase';
import { PasswordRecoveryRepository } from './infrastructure/password-recovery.repository';
import { LogoutDeviceUseCase } from '@modules/user-accounts/application/usecases/users/logout-user.usecase';
import { DeviceRepository } from '@modules/user-accounts/infrastructure/device.repository';

const commandHandlers = [
  RegisterUserUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  LoginUserUseCase,
  NewPasswordUseCase,
  PasswordRecoveryUseCase,
  LogoutDeviceUseCase,
];

const queryHandlers = [];

@Module({
  imports: [JwtModule, CqrsModule, NotificationsModule, HttpModule],
  controllers: [AuthController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    UsersRepository,
    DeviceRepository,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.accessTokenSecret,
          signOptions: {
            expiresIn: userAccountConfig.accessTokenExpireIn as StringValue,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.refreshTokenSecret,
          signOptions: {
            expiresIn: userAccountConfig.refreshTokenExpireIn as StringValue,
          },
        });
      },
      inject: [UserAccountsConfig],
    },

    // UsersQueryRepository,
    CryptoService,
    UuidService,
    EmailService,
    EmailExamples,
    UsersFactory,
    EmailConfirmationFactory,
    EmailConfirmationRepository,
    PasswordRecoveryRepository,
    LocalStrategy,
    AuthService,
    UserAccountsConfig,
    GoogleRecaptchaService,
    DeviceRepository,
  ],
  exports: [REFRESH_TOKEN_STRATEGY_INJECT_TOKEN, DeviceRepository],
})
export class UserAccountsModule {}
