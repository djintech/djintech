import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '@modules/sessions/infrastructure/sessions.repository';

export class DeleteAllDevicesCommand implements ICommand {
  constructor(
    public readonly userId: number,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteAllDevicesCommand)
@Injectable()
export class DeleteAllDevicesUseCase implements ICommandHandler<DeleteAllDevicesCommand> {
  constructor(private readonly repo: SessionsRepository) {}

  async execute(command: DeleteAllDevicesCommand) {
    return this.repo.softDeleteAllExcept(command.userId, command.deviceId);
  }
}
