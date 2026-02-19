import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '@modules/sessions/infrastructure/sessions.repository';

export class GetUserDevicesCommand implements ICommand {
  constructor(public readonly userId: number) {}
}

@CommandHandler(GetUserDevicesCommand)
@Injectable()
export class GetUserDevicesUseCase implements ICommandHandler<GetUserDevicesCommand> {
  constructor(private readonly repo: SessionsRepository) {}

  async execute(command: GetUserDevicesCommand) {
    return this.repo.findAllByUser(command.userId);
  }
}
