import { Request, Response } from 'express';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
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
import { ApiBody, ApiSecurity } from '@nestjs/swagger';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { LoginUserCommand } from '../application/usecases/users/login-user.usecase';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../dto/user-context.dto';
import { CookieService } from '../application/services/cookie.service';
import { JwtRefreshTokenGuard } from '../guards/refresh-token/jwt-refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('login')
  //@SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'string' },
        password: { type: 'string', example: 'string1A' },
      },
    },
  })
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      { accessToken: string; refreshToken: string }
    >(
      new LoginUserCommand({
        userId: user.id,
        ip: req.ip,
        deviceName: req.headers['user-agent'] ?? 'unknown',
      }),
    );

    CookieService.setRefreshTokenCookie(response, refreshToken);
    return { accessToken };
  }

  @Post('registration')
  //@SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('registration-confirmation')
  //@SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationConfirmation(
    @Body() body: RegistrationConfirmationInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new RegistrationConfirmationCommand(body));
  }

  @Post('registration-email-resending')
  //@SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationEmailResending(
    @Body() body: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new RegistrationEmailResendingCommand(body));
  }

  @ApiSecurity('refreshToken')
  @Post('logout')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Res({ passthrough: true }) response: Response) {
    CookieService.clearRefreshTokenCookie(response);
  }
}
