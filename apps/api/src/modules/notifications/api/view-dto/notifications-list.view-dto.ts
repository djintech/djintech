import { ApiProperty } from '@nestjs/swagger';
import { NotificationViewDto } from './notification.view-dto';

export class NotificationsListViewDto {
  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  totalCount!: number;

  @ApiProperty()
  notReadCount!: number;

  @ApiProperty({
    type: NotificationViewDto,
    isArray: true,
  })
  items!: NotificationViewDto[];
}