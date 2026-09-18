import { ApiProperty } from '@nestjs/swagger';
import { MessengerChatViewDto } from './messenger-chat.view-dto';
import { ChatQueryResult } from '../../infrastructure/types/chat-query-result';
import { FileUrlService } from '@src/core/file/file-url.service';

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

  static mapChatToView( chat: ChatQueryResult, fileUrlService: FileUrlService,): MessengerChatViewDto {
    return {
      id: chat.id,
      ownerId: chat.ownerId,
      receiverId: chat.receiverId,
      messageText: chat.messageText,

      mediaContent:
        chat.mediaFileType && chat.mediaKey
          ? {
              fileType: chat.mediaFileType,
              fileUrl: fileUrlService.getPublicUrl(chat.mediaKey),
            }
          : null,

      status: chat.status,
      messageType: chat.messageType,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,

      userName: chat.userName,

      avatar: chat.avatarUrl
        ? fileUrlService.getPublicUrl(chat.avatarUrl)
        : null,

      notReadCount: chat.notReadCount,
    };
  }

  static mapMessagesToView(
    items: ChatQueryResult[],
    pageSize: number,
    totalCount: number,
    notReadCount: number,
    fileUrlService: FileUrlService,
  ): GetMessagesViewDto {
    return {
      pageSize,
      totalCount,
      notReadCount,

      items: items.map((item) => this.mapChatToView(item, fileUrlService)),
    };
  }
}
