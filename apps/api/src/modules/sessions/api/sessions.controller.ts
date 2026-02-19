import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetUserDevicesCommand } from '@modules/sessions/application/usecases/get-devices.usecase';
import { DeleteAllDevicesCommand } from '@modules/sessions/application/usecases/delete-other-devices.usecase';
import { DeleteDeviceCommand } from '@modules/sessions/application/usecases/delete-device.usecase';
import { JwtRefreshTokenGuard } from '@modules/user-accounts/guards/refresh-token/jwt-refresh-token.guard';
import { ExtractDeviceFromRefresh } from '@modules/user-accounts/guards/decorators/param/extract-device-from-refresh.decorator';

@UseGuards(JwtRefreshTokenGuard)
@Controller('security/devices')
export class SessionsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get()
  getDevices(
    @ExtractDeviceFromRefresh() payload: { deviceId: string; userId: number },
  ) {
    return this.commandBus.execute(new GetUserDevicesCommand(payload.userId));
  }

  @Delete()
  deleteAllDevices(
    @ExtractDeviceFromRefresh() payload: { deviceId: string; userId: number },
  ) {
    return this.commandBus.execute(
      new DeleteAllDevicesCommand(payload.userId, payload.deviceId),
    );
  }

  @Delete(':deviceId')
  deleteDevice(
    @Param('deviceId') deviceId: string,
    @ExtractDeviceFromRefresh() payload: { deviceId: string; userId: number },
  ) {
    return this.commandBus.execute(new DeleteDeviceCommand(deviceId, payload));
  }
}
