import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '@modules/sessions/infrastructure/sessions.repository';

export class DeleteDeviceCommand implements ICommand {
  constructor(
    public readonly deviceId: string,
    public readonly payload: { deviceId: string; userId: number },
  ) {}
}

@CommandHandler(DeleteDeviceCommand)
@Injectable()
export class DeleteDeviceUseCase implements ICommandHandler<DeleteDeviceCommand> {
  constructor(private readonly repo: SessionsRepository) {}

  async execute(command: DeleteDeviceCommand) {
    const { payload } = command;
    const device = await this.repo.findByDeviceIdAndUserId(
      command.deviceId,
      payload.userId,
    );
    if (!device) {
      throw new NotFoundException(
        `Device with id ${command.deviceId} not found`,
      );
    }
    return this.repo.softDelete(command.deviceId);
  }
}
