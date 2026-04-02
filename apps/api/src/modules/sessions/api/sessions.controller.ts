import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetUserDevicesCommand } from '@modules/sessions/application/usecases/get-devices.usecase';
import { DeleteAllDevicesCommand } from '@modules/sessions/application/usecases/delete-other-devices.usecase';
import { DeleteDeviceCommand } from '@modules/sessions/application/usecases/delete-device.usecase';
import { ExtractDeviceFromRefresh } from '@src/modules/user-accounts/auth/guards/decorators/param/extract-device-from-refresh.decorator';
import { JwtAuthGuard } from '@src/modules/user-accounts/auth/guards/bearer/jwt-auth.guard';
import { ApiSecurity, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtRefreshTokenGuard } from '@src/modules/user-accounts/auth/guards/refresh-token/jwt-refresh-token.guard';

@SkipThrottle()
@UseGuards(JwtAuthGuard, JwtRefreshTokenGuard)
@Controller('security/devices')
export class SessionsController {
  constructor(private readonly commandBus: CommandBus) {}

  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' })
  @ApiSecurity('JwtAuth')
  @Get()
  getDevices(
    @ExtractDeviceFromRefresh() payload: { deviceId: string; userId: number },
  ) {
    return this.commandBus.execute(new GetUserDevicesCommand(payload.userId));
  }

  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' })
  @ApiSecurity('JwtAuth')
  @Delete()
  deleteAllDevices(
    @ExtractDeviceFromRefresh() payload: { deviceId: string; userId: number },
  ) {
    return this.commandBus.execute(
      new DeleteAllDevicesCommand(payload.userId, payload.deviceId),
    );
  }

  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' })
  @ApiSecurity('JwtAuth')
  @Delete(':deviceId')
  deleteDevice(
    @Param('deviceId') deviceId: string,
    @ExtractDeviceFromRefresh() payload: { deviceId: string; userId: number },
  ) {
    return this.commandBus.execute(new DeleteDeviceCommand(deviceId, payload));
  }
}
