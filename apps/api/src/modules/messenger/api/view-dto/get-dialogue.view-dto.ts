import { ApiProperty } from '@nestjs/swagger';

import { MessageViewDto } from './message.view-dto';
import { MessageWithMedia } from '../../infrastructure/types/message-with-media.type';
import { FileUrlService } from '@src/core/file/file-url.service';

export class GetDialogueViewDto {
  @ApiProperty({
    example: 12,
  })
  pageSize!: number;

  @ApiProperty({
    example: 48,
  })
  totalCount!: number;

  @ApiProperty({
    example: 2,
  })
  notReadCount!: number;

  @ApiProperty({
    type: [MessageViewDto],
  })
  items!: MessageViewDto[];

  static mapDialogueToView(
    items: MessageWithMedia[],
    pageSize: number,
    totalCount: number,
    notReadCount: number,
    fileUrlService: FileUrlService,
  ): GetDialogueViewDto {
    return {
      pageSize,
      totalCount,
      notReadCount,

      items: items.map(
        (item) => MessageViewDto.mapToView( item, fileUrlService ),
      ),
    };
  }
}
