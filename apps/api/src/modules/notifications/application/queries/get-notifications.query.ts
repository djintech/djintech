import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotificationsRepository } from '../../infrastructure/notifications.repository';
import { NotificationViewDto } from '../../api/view-dto/notification.view-dto';
import { NotificationsListViewDto } from '../../api/view-dto/notifications-list.view-dto';
import { SortDirection } from '@src/core/dto/base.query-params.input-dto';

export class GetNotificationsQuery {
  constructor(
    public readonly payload: {
      userId: number;
      cursor: number;
      pageSize: number;
      isRead?: boolean;
      sortDirection: SortDirection;
    },
  ) {}
}

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler
  implements IQueryHandler<GetNotificationsQuery, NotificationsListViewDto>
{
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async execute({ payload }: GetNotificationsQuery) {
    const { userId, cursor, pageSize, isRead, sortDirection } = payload;
    const items = await this.notificationsRepository.findByUserIdCursor( userId, cursor, pageSize, isRead, sortDirection );

    const totalCount = await this.notificationsRepository.countAll( userId, isRead );
    const notReadCount = await this.notificationsRepository.countUnread( userId );

    return {
      pageSize: pageSize,
      totalCount,
      notReadCount,
      items: items.map(NotificationViewDto.mapToView),
    };
  }
}
