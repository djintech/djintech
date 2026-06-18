import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationsRepository } from '../../infrastructure/notifications.repository';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';

export class DeleteNotificationCommand {
  constructor(
    public readonly notificationId: number,
    public readonly userId: number,
  ) {}
}

@CommandHandler(DeleteNotificationCommand)
export class DeleteNotificationUseCase
  implements ICommandHandler<DeleteNotificationCommand, void>
{
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async execute({ notificationId, userId }: DeleteNotificationCommand): Promise<void> {
    const notification = await this.notificationsRepository.findById(notificationId);

    if (!notification) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Notification not found',
        extensions: [{ message: 'Notification not found', field: 'notification' }],
      });
    }

    if (notification.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden. The user is not the owner of the notification.',
      });
    }

    await this.notificationsRepository.softDelete(notificationId);
  }
}
