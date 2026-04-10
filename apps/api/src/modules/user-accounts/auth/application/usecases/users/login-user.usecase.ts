import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '@src/modules/user-accounts/auth/constants/auth-tokens.inject-constants';
import { UuidService } from '@libs/utils/src/uuid/uuid.service';
import { DeviceRepository } from '@src/modules/user-accounts/auth/infrastructure/device.repository';
import { RequestMetadataDto } from '@src/modules/user-accounts/auth/dto/request-metadata.dto';
import { Device } from '@src/generated/prisma/client';
import { RefreshTokenPayloadType } from '../../dto/refresh-token-payload.type';

export class LoginUserCommand {
  constructor(
    public dto: {
      userId: string,
      metadata: RequestMetadataDto
    }) {}
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
    let existingDevice: Device | null = null;
    let existingPayload;

    if (dto.metadata.refreshToken) {
      try {
        existingPayload = await this.refreshTokenContext.verify(dto.metadata.refreshToken);
        existingDevice = await this.deviceRepository.findByDeviceId( existingPayload.deviceId );
      } catch (error:any) {
        existingDevice = null;
        if (error?.name && error.name !== 'TokenExpiredError') {
          console.log("Refres Token verify some error ", error);
        }        
      }
    }

    const deviceId = existingDevice?.deviceId || this.uuidService.generate();
    const accessToken = this.accessTokenContext.sign({ id: dto.userId });
    const refreshToken = this.refreshTokenContext.sign({
      id: dto.userId,
      deviceId,
    });

    const payload = this.refreshTokenContext.verify<RefreshTokenPayloadType>(refreshToken);

    if (existingDevice) {  
      await this.deviceRepository.update(existingDevice.id, {
        ip: dto.metadata.ip || 'unknown',        
        deviceName: dto.metadata.deviceName,
        lastActiveAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
      });
    } else {
      await this.deviceRepository.create({
        deviceName: dto.metadata.deviceName,
        deviceId,
        ip: dto.metadata.ip || 'unknown',
        lastActiveAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
        userId: +dto.userId,
      });
    }

    //console.log('!!!refreshToken !!!!!!!!!!!! ', refreshToken);
    
    return {
      accessToken,
      refreshToken,
    };
  }
}
