import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationsRepository } from '../../infrastructure/notifications.repository';

export class MarkAsReadCommand {
  constructor(
    public readonly userId: number,
    public readonly ids: number[],
  ) {}
}

@CommandHandler(MarkAsReadCommand)
export class MarkAsReadUseCase
  implements ICommandHandler<MarkAsReadCommand, void>
{
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async execute({ userId, ids }: MarkAsReadCommand): Promise<void> {
    await this.notificationsRepository.markAsRead(userId, ids);
  }
}
