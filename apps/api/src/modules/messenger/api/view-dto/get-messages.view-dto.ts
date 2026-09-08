import { ApiProperty } from '@nestjs/swagger';
import { MessengerChatViewDto } from './messenger-chat.view-dto';
import { ChatQueryResult } from '../../infrastructure/types/chat-query-result';

export class GetMessagesViewDto {
  @ApiProperty({
    example: 12,
  })
  pageSize!: number;

  @ApiProperty({
    example: 5,
  })
  totalCount!: number;

  @ApiProperty({
    example: 3,
  })
  notReadCount!: number;

  @ApiProperty({
    type: [MessengerChatViewDto],
  })
  items!: MessengerChatViewDto[];

  static mapChatToView( chat: ChatQueryResult, avatarUrl: string | null): MessengerChatViewDto {
    return {
      id: chat.id,
      ownerId: chat.ownerId,
      receiverId: chat.receiverId,
      messageText: chat.messageText,
      status: chat.status,
      messageType: chat.messageType,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,

      userName: chat.userName,
      avatar: avatarUrl,
      notReadCount: chat.notReadCount,
    };
  }

  static mapMessagesToView(
    items: ChatQueryResult[],
    pageSize: number,
    totalCount: number,
    notReadCount: number,
    mapFileUrl: (key: string | null) => string | null,
  ): GetMessagesViewDto {
    return {
      pageSize,
      totalCount,
      notReadCount,

      items: items.map(
        (item) => this.mapChatToView(item, mapFileUrl(item.avatarUrl)),
      ),
    };
  }
}
