import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@src/generated/prisma/enums';
import { Notification } from '@src/generated/prisma/client';

export class NotificationViewDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ enum: NotificationType })
  type!: NotificationType;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  isRead!: boolean;

  @ApiProperty()
  notifyAt!: Date;

  @ApiProperty()
  createdAt!: Date;

  static mapToView(notification: Notification): NotificationViewDto {
    return {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      isRead: notification.isRead,
      notifyAt: notification.notifyAt,
      createdAt: notification.createdAt,
    };
  }
}
