import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { cookieConfig } from '@src/core/config/cookie.config';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { RequestWithCookies } from './request-with-cookies';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { DeviceRepository } from '@src/modules/user-accounts/auth/infrastructure/device.repository';
import { RefreshTokenPayloadType } from '../../application/dto/refresh-token-payload.type';
@Injectable()
export class JwtRefreshTokenGuard implements CanActivate {
  constructor(
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly jwtService: JwtService,
    private readonly deviceRepository: DeviceRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithCookies>();
    const refreshToken = request.cookies?.[cookieConfig.refreshToken.name];

    if (!refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<RefreshTokenPayloadType>(
          refreshToken,
        );
      const device = await this.deviceRepository.findByDeviceId(
        payload.deviceId,
      );
      if (!device || device.deletedAt) {
        throw new DomainException({
          code: DomainExceptionCode.Unauthorized,
          message: 'Invalid refresh token',
        });
      }
      const iat = new Date(payload.iat * 1000);
      const exp = new Date(payload.exp * 1000);
      if (device.lastActiveAt.getTime() !== iat.getTime() && device.expiresAt.getTime() !== exp.getTime()) {
        throw new DomainException({
          code: DomainExceptionCode.Unauthorized,
          message: 'Invalid refresh token',
        });
      }

      request.securityContext = {
        userId: device.userId,
        deviceId: device.deviceId + '',
      };
    } catch (error) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    return true;
  }
}
