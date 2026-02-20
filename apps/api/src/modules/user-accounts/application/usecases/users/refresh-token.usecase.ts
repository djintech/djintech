import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '@src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { UuidService } from '@modules/user-accounts/application/services/uuid.service';
import { RefreshTokenPayloadType } from '@modules/user-accounts/application/dto/refresh-token-payload.type';
import { DeviceRepository } from '@modules/user-accounts/infrastructure/device.repository';

export class RefreshTokenCommand {
  constructor(public dto: { userId: number; deviceId: string }) {}
}

@CommandHandler(RefreshTokenCommand)
export class LoginUserUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private readonly deviceRepository: DeviceRepository,
    private readonly uuidService: UuidService,
  ) {}

  async execute({ dto }: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.accessTokenContext.sign({ id: dto.userId });
    const refreshToken = this.refreshTokenContext.sign({
      id: dto.userId,
      deviceId: dto.deviceId,
    });
    const payload =
      this.refreshTokenContext.verify<RefreshTokenPayloadType>(refreshToken);
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
