import { Request, Response } from 'express';
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
import { RegisterUserCommand } from '../application/usecases/users/register-user.usecase';
import { RegistrationConfirmationInputDto } from './input-dto/registration-confirmation.input-dto';
import { RegistrationEmailResendingInputDto } from './input-dto/registration-email-resending.input-dto';
import { RegistrationConfirmationCommand } from '../application/usecases/users/registration-confirmation.usecase';
import { RegistrationEmailResendingCommand } from '../application/usecases/users/registration-email-resending.usecase';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiNoContentResponse, ApiOkResponse, ApiSecurity, ApiTooManyRequestsResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { LoginUserCommand } from '../application/usecases/users/login-user.usecase';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../dto/user-context.dto';
import { CookieService } from '../application/services/cookie.service';
import { JwtRefreshTokenGuard } from '../guards/refresh-token/jwt-refresh-token.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { NewPasswordInputDto } from './input-dto/new-password.input-dto';
import { NewPasswordCommand } from '../application/usecases/users/new-password.usecase';
import { RecaptchaGuard } from '../guards/recaptcha/recaptcha.guard';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { PasswordRecoveryCommand } from '../application/usecases/users/password-recovery.usecase';
import { ExtractDeviceFromRefresh } from '@modules/user-accounts/guards/decorators/param/extract-device-from-refresh.decorator';
import { LogoutDeviceCommand } from '@modules/user-accounts/application/usecases/users/logout-user.usecase';
import { RefreshTokenCommand } from '@modules/user-accounts/application/usecases/users/refresh-token.usecase';
import { LoginViewDto } from './view-dto/login.view-dto';
import { LoginInputDto } from './input-dto/login-input.dto';
import { RequestMetadataDto } from '../dto/request-metadata.dto';
import { RequestMetadata } from '../guards/decorators/request-metadata.decorator';
import { SecurityDeviceContextDto } from '../dto/security-device-context.dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { RefreshTokenViewDto } from './view-dto/refresh-token.view-dto';
import { MeViewDto } from './view-dto/me.view-dto';
import { GetMeQuery } from '../application/queries/get-me.query';

@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @ApiBearerAuth('JwtAuth')
  @ApiOkResponse({ type: MeViewDto, description: 'success' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized: JJWT refreshToken inside cookie is missing, expired or incorrect' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.queryBus.execute( new GetMeQuery( user )); 
  }

  @Post('login')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginInputDto })
  @ApiOkResponse({ type: LoginViewDto, description: 'success' })
  @ApiBadRequestResponse({
    description: 'Authentication errors or registration not confirmed. Possible errors: invalid credentials, email not confirmed',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized: Invalid email or password, or email not confirmed' })
  @ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' })
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

  @ApiSecurity('refreshToken')
  @ApiSecurity('JwtAuth')
  @ApiNoContentResponse({ description: 'success' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized: JWT accessToken is missing, expired or incorrect' })
  @Post('logout')
  @UseGuards(JwtAuthGuard, JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Res({ passthrough: true }) response: Response,
    @ExtractDeviceFromRefresh() payload: SecurityDeviceContextDto,
  ) {
    await this.commandBus.execute(new LogoutDeviceCommand(payload.deviceId));
    CookieService.clearRefreshTokenCookie(response);
  }

  @Post('registration')
  @ApiNoContentResponse({ description: 'An email with a verification code has been sent to the specified email address'})
  @ApiBadRequestResponse({
    description: 'Validation errors or user already exists. Password validation, incorrect email or username format',
    type: ErrorResponseDto
  })
  @ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' })
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('registration-confirmation')
  @ApiNoContentResponse({ description: 'Email was verified. Account was activated'})
  @ApiBadRequestResponse({
    description: 'Incorrect input data',
    type: ErrorResponseDto
  })
  @ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' })
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationConfirmation(
    @Body() body: RegistrationConfirmationInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new RegistrationConfirmationCommand(body));
  }

  @Post('registration-email-resending')
  @ApiNoContentResponse({ description: 'An email with a verification code has been sent to the specified email address'})
  @ApiBadRequestResponse({
    description: 'Incorrect input data',
    type: ErrorResponseDto
  })
  @ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' })
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationEmailResending(
    @Body() body: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new RegistrationEmailResendingCommand(body));
  }

  @Post('password-recovery')
  @ApiNoContentResponse({ description: 'success' })
  @ApiBadRequestResponse({
    description: 'Validation errors or reCAPTCHA failure. Possible errors: invalid reCAPTCHA, incorrect email format',
    type: ErrorResponseDto
  })
  @ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' })
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @UseGuards(RecaptchaGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  passwordRecovery(@Body() body: PasswordRecoveryInputDto): Promise<void>{
    return this.commandBus.execute(new PasswordRecoveryCommand({ email: body.email }));
  }

  @Post('new-password')
  @ApiNoContentResponse({ description: 'success' })
  @ApiBadRequestResponse({
    description: 'Incorrect input data by field. Possible errors: Password recovery code is invalid',
    type: ErrorResponseDto
  })
  @ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' })
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  newPassword (@Body() body: NewPasswordInputDto): Promise<void>{
    return this.commandBus.execute(new NewPasswordCommand( body ));
  }
  
  @ApiSecurity('refreshToken')
  @ApiOkResponse({ type: RefreshTokenViewDto,  description: 'Returns JWT accessToken (expired after 15 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 1d).' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' }) 
  @Post('refresh-token')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
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
