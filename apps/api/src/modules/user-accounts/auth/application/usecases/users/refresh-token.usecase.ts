import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '@src/modules/user-accounts/auth/constants/auth-tokens.inject-constants';
import { DeviceRepository } from '@src/modules/user-accounts/auth/infrastructure/device.repository';
import { UsersRepository } from '@src/modules/user-accounts/auth/infrastructure/users.repository';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { RefreshTokenPayloadType } from '../../dto/refresh-token-payload.type';

export class RefreshTokenCommand {
  constructor(public dto: { userId: number; deviceId: string }) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private readonly deviceRepository: DeviceRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.usersRepository.findById( Number(dto.userId) );
    if ( !user ) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      }); 
    }

    const device = await this.deviceRepository.findByDeviceId(dto.deviceId);
    if (!device) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'not found device',
      });
    }

    const accessToken = this.accessTokenContext.sign({ id: dto.userId });
    const refreshToken = this.refreshTokenContext.sign({
      id: dto.userId,
      deviceId: dto.deviceId,
    });
    const payload = this.refreshTokenContext.verify<RefreshTokenPayloadType>(refreshToken);
    
    const lastActiveAt = new Date(payload.iat * 1000);
    const expiresAt = new Date(payload.exp * 1000);
    await this.deviceRepository.updateLastActive(
      dto.deviceId,
      lastActiveAt,
      expiresAt,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
