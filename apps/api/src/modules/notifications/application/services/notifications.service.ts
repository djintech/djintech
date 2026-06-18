import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from '../../infrastructure/notifications.gateway';
import { NotificationsRepository } from '../../infrastructure/notifications.repository';
import { NotificationType } from '@src/generated/prisma/client';
import { NotificationViewDto } from '../../api/view-dto/notification.view-dto';

export type CreateAndSendNotificationDto = {
  userId: number;
  type: NotificationType;
  message: string;
  notifyAt: Date;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createAndSend({
    userId,
    type,
    message,
    notifyAt,
  }: CreateAndSendNotificationDto) {
    const notification = await this.notificationsRepository.create({
      user: { connect: { id: userId } },
      type,
      message,
      notifyAt,
    });

    const payload = NotificationViewDto.mapToView(notification);

    this.notificationsGateway.sendNotification(userId, payload);

    return notification;
  }
}
