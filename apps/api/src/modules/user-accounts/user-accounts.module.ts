import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth/api/auth.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersRepository } from './auth/infrastructure/users.repository';
import { EmailService } from '../notifications/email.service';
import { EmailExamples } from '../notifications/email-examples';
import { EmailConfirmationRepository } from './auth/infrastructure/email-confirmation.repository';
import { LocalStrategy } from './auth/guards/local/local.strategy';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './auth/constants/auth-tokens.inject-constants';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserAccountsConfig } from './auth/config/user-accounts.config';
import type { StringValue } from 'ms';
import { PasswordRecoveryRepository } from './auth/infrastructure/password-recovery.repository';
import { DeviceRepository } from '@src/modules/user-accounts/auth/infrastructure/device.repository';
import { JwtStrategy } from './auth/guards/bearer/jwt.strategy';
import { PoliciesModule } from '../privacy/policies.module';
import { AuthQueryRepository } from './auth/infrastructure/query/auth.query-repository';
import { GoogleAuthController } from './auth/api/google-oauth.controller';
import { GoogleOAuthConfig } from './auth/config/google-oauth.config';
import { GoogleStrategy } from './auth/guards/google/google.strategy';
import { UserProvidersRepository } from './auth/infrastructure/user-providers.repository';
import { RegisterUserUseCase } from './auth/application/usecases/users/register-user.usecase';
import { RegistrationConfirmationUseCase } from './auth/application/usecases/users/registration-confirmation.usecase';
import { RegistrationEmailResendingUseCase } from './auth/application/usecases/users/registration-email-resending.usecase';
import { LoginUserUseCase } from './auth/application/usecases/users/login-user.usecase';
import { NewPasswordUseCase } from './auth/application/usecases/users/new-password.usecase';
import { PasswordRecoveryUseCase } from './auth/application/usecases/users/password-recovery.usecase';
import { LogoutDeviceUseCase } from './auth/application/usecases/users/logout-user.usecase';
import { RefreshTokenUseCase } from './auth/application/usecases/users/refresh-token.usecase';
import { LoginUserByProviderUseCase } from './auth/application/usecases/users/login-user-by-provider.usecase';
import { GetMeQueryHandler } from './auth/application/queries/get-me.query';
import { CryptoService } from './auth/application/services/crypto.service';
import { EmailConfirmationFactory } from './auth/application/factories/email-confirmation.factory';
import { UsersFactory } from './auth/application/factories/users.factory';
import { AuthService } from './auth/application/services/auth.service';
import { GoogleRecaptchaService } from './auth/application/services/recaptcha.service';

const commandHandlers = [
  RegisterUserUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  LoginUserUseCase,
  NewPasswordUseCase,
  PasswordRecoveryUseCase,
  LogoutDeviceUseCase,
  RefreshTokenUseCase,
  LoginUserByProviderUseCase,
];

const queryHandlers = [
  GetMeQueryHandler
];

@Module({
  imports: [JwtModule, CqrsModule, NotificationsModule, HttpModule, PoliciesModule],
  controllers: [AuthController, GoogleAuthController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    UsersRepository,
    UserProvidersRepository,
    AuthQueryRepository,
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

    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    CryptoService,
    EmailService,
    EmailExamples,
    UsersFactory,
    EmailConfirmationFactory,
    EmailConfirmationRepository,
    PasswordRecoveryRepository,
    AuthService,
    UserAccountsConfig,
    GoogleOAuthConfig,
    GoogleRecaptchaService,
    DeviceRepository,
  ],
  exports: [REFRESH_TOKEN_STRATEGY_INJECT_TOKEN, DeviceRepository, JwtStrategy],
})
export class UserAccountsModule {}
