import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMessagesParamsDto } from '../../api/input-dto/get-messages.input-dto';
import { MessageQueryRepository } from '../../infrastructure/query/message.query.repository';
import { GetMessagesViewDto } from '../../api/view-dto/get-messages.view-dto';
import { FileUrlService } from '@src/core/file/file-url.service';

export class GetMessagesQuery {
  constructor(
      public readonly userId: number,
      public readonly query: GetMessagesParamsDto,
  ) {}
}

@QueryHandler(GetMessagesQuery)
export class GetMessagesHandler
  implements IQueryHandler<GetMessagesQuery, GetMessagesViewDto>
{
  constructor(
    private readonly  messageQueryRepository: MessageQueryRepository,
    private readonly fileUrlService: FileUrlService
  ) {}

  async execute({ userId, query }: GetMessagesQuery): Promise<GetMessagesViewDto> {
    const { pageSize = 12, cursor = 0, searchName } = query;

    const [ chats, totalCount, notReadCount ] = await Promise.all([
      this.messageQueryRepository.findChats( userId, pageSize, cursor, searchName ),
      this.messageQueryRepository.countChats( userId, searchName ),
      this.messageQueryRepository.countUnreadMessages( userId ),
    ]);

    return GetMessagesViewDto.mapMessagesToView(
      chats,
      pageSize,
      totalCount,
      notReadCount,
      this.fileUrlService,
    );
  }
}
