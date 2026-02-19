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

export class LoginUserCommand {
  constructor(
    public dto: { userId: string; ip: string | undefined; deviceName: string },
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private readonly deviceRepository: DeviceRepository,
    private readonly uuidService: UuidService,
  ) {}

  async execute({
    dto,
  }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const deviceId = this.uuidService.generate();
    const accessToken = this.accessTokenContext.sign({ id: dto.userId });
    const refreshToken = this.refreshTokenContext.sign({
      id: dto.userId,
      deviceId,
    });
    const payload =
      this.refreshTokenContext.verify<RefreshTokenPayloadType>(refreshToken);
    await this.deviceRepository.create({
      deviceName: dto.deviceName,
      deviceId,
      ip: dto.ip || 'unknown',
      lastActiveAt: new Date(payload.iat * 1000),
      expiresAt: new Date(payload.exp * 1000),
      userId: +dto.userId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
