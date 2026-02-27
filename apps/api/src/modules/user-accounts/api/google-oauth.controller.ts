import { Response } from 'express';
import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiTooManyRequestsResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { ErrorResponseDto } from "@src/core/error-dto/error-response.dto";
import { CommandBus } from "@nestjs/cqrs";
import { GoogleAuthGuard } from "../guards/google/google-auth.guard";
import { ExtractUserFromProviderRequest } from "../guards/decorators/param/extract-user-from-provider-request.decorator";
import { CookieService } from "../application/services/cookie.service";
import { UserProviderContextDto } from '../dto/user-provider-context.dto';
import { LoginViewDto } from './view-dto/login.view-dto';
import { LoginUserByProviderCommand } from '../application/usecases/users/login-user-by-provider.usecase';
import { ProviderType } from '@src/generated/prisma/enums';
import { RequestMetadata } from '../guards/decorators/request-metadata.decorator';
import { RequestMetadataDto } from '../dto/request-metadata.dto';


@SkipThrottle()
@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private commandBus: CommandBus,
  ) {}

  @Get('login')
  @ApiOperation({ summary: 'Login via Google OAuth', description: 'Redirects user to Google for authentication'  })
  @ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' })
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // redirect happens automatically
  }
  
  @Get('callback')
  @ApiOperation({ summary: 'Update tokens for Google OAuth user.', description: 'Create or update user if nessesary. Generate new pair of access and refresh tokens for authenticated user.'  })
  @ApiCreatedResponse({ type: LoginViewDto, description: 'Successful login' })
  @ApiUnauthorizedResponse({ description: 'Email not verified by google' })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: 'there is no user in the request object!' })
  @UseGuards(GoogleAuthGuard)
  async googleCallback( 
    @RequestMetadata() metadata: RequestMetadataDto,
    @ExtractUserFromProviderRequest() user: UserProviderContextDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginViewDto> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
          LoginUserByProviderCommand,
          { accessToken: string; refreshToken: string }
        >(
          new LoginUserByProviderCommand(user, ProviderType.google, metadata)
        );

    CookieService.setRefreshTokenCookie(response, refreshToken);
    return { accessToken };
  }
}