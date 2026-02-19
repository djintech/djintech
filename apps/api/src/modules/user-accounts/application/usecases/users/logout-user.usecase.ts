import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '@modules/user-accounts/infrastructure/device.repository';

export class LogoutDeviceCommand implements ICommand {
  constructor(public readonly deviceId: string) {}
}

@CommandHandler(LogoutDeviceCommand)
@Injectable()
export class LogoutDeviceUseCase implements ICommandHandler<LogoutDeviceCommand> {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async execute(command: LogoutDeviceCommand) {
    return this.deviceRepository.softDelete(command.deviceId);
  }
}
