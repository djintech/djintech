import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { RegistrationConfirmationInputDto } from './input-dto/registration-confirmation.input-dto';
import { RegistrationEmailResendingInputDto } from './input-dto/registration-email-resending.input-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../dto/user-context.dto';
import { JwtRefreshTokenGuard } from '../guards/refresh-token/jwt-refresh-token.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { NewPasswordInputDto } from './input-dto/new-password.input-dto';
import { RecaptchaGuard } from '../guards/recaptcha/recaptcha.guard';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { ExtractDeviceFromRefresh } from '@src/modules/user-accounts/auth/guards/decorators/param/extract-device-from-refresh.decorator';
import { LoginViewDto } from './view-dto/login.view-dto';
import { RequestMetadataDto } from '../dto/request-metadata.dto';
import { RequestMetadata } from '../guards/decorators/request-metadata.decorator';
import { SecurityDeviceContextDto } from '../dto/security-device-context.dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { RefreshTokenViewDto } from './view-dto/refresh-token.view-dto';
import { MeViewDto } from './view-dto/me.view-dto';
import { GetMeQuery } from '../application/queries/get-me.query';
import { LoginUserCommand } from '../application/usecases/users/login-user.usecase';
import { CookieService } from '../application/services/cookie.service';
import { LogoutDeviceCommand } from '../application/usecases/users/logout-user.usecase';
import { RegisterUserCommand } from '../application/usecases/users/register-user.usecase';
import { RegistrationEmailResendingCommand } from '../application/usecases/users/registration-email-resending.usecase';
import { PasswordRecoveryCommand } from '../application/usecases/users/password-recovery.usecase';
import { NewPasswordCommand } from '../application/usecases/users/new-password.usecase';
import { RefreshTokenCommand } from '../application/usecases/users/refresh-token.usecase';
import { RegistrationConfirmationCommand } from '../application/usecases/users/registration-confirmation.usecase';
import { ApiGetMeDocs } from '../swagger/get-me.swagger';
import { ApiLoginDocs } from '../swagger/login.swagger';
import { ApiLogoutDocs } from '../swagger/logout.swagger';
import { ApiRegistrationDocs } from '../swagger/registration.swagger';
import { ApiRegistrationConfirmationDocs } from '../swagger/registration-confirmation.swagger';
import { ApiRegistrationEmailResendingDocs } from '../swagger/registration-email-resending.swagger';
import { ApiPasswordRecoveryDocs } from '../swagger/password-recovery.swagger';
import { ApiNewPasswordDocs } from '../swagger/new-password.swagger';
import { ApiRefreshTokenDocs } from '../swagger/refresh-token.swagger';

@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiGetMeDocs()
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.queryBus.execute( new GetMeQuery( user )); 
  }

  @Post('login')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiLoginDocs()
  async login(
    @RequestMetadata() metadata: RequestMetadataDto,
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginViewDto> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      { accessToken: string; refreshToken: string }
    >(
      new LoginUserCommand({ userId: user.id, metadata })
    );

    CookieService.setRefreshTokenCookie(response, refreshToken);
    return { accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiLogoutDocs()
  async logout(
    @Res({ passthrough: true }) response: Response,
    @ExtractDeviceFromRefresh() payload: SecurityDeviceContextDto,
  ) {
    await this.commandBus.execute(new LogoutDeviceCommand(payload.deviceId));
    CookieService.clearRefreshTokenCookie(response);
  }

  @Post('registration')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRegistrationDocs()
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('registration-confirmation')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRegistrationConfirmationDocs()
  registrationConfirmation(
    @Body() body: RegistrationConfirmationInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new RegistrationConfirmationCommand(body));
  }

  @Post('registration-email-resending')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRegistrationEmailResendingDocs()
  registrationEmailResending(
    @Body() body: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new RegistrationEmailResendingCommand(body));
  }

  @Post('password-recovery')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @UseGuards(RecaptchaGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiPasswordRecoveryDocs()
  passwordRecovery(@Body() body: PasswordRecoveryInputDto): Promise<void>{
    return this.commandBus.execute(new PasswordRecoveryCommand({ email: body.email }));
  }

  @Post('new-password')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNewPasswordDocs()
  newPassword (@Body() body: NewPasswordInputDto): Promise<void>{
    return this.commandBus.execute(new NewPasswordCommand( body ));
  }
  
  @Post('refresh-token')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiRefreshTokenDocs()
  async refreshToken(
    @Res({ passthrough: true }) response: Response,
    @ExtractDeviceFromRefresh() payload: { deviceId: string; userId: number },
  ): Promise<RefreshTokenViewDto> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      RefreshTokenCommand,
      { accessToken: string; refreshToken: string }
    >(new RefreshTokenCommand(payload));
    CookieService.setRefreshTokenCookie(response, refreshToken);
    return { accessToken };
  }
}
