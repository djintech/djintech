import { ApiProperty } from '@nestjs/swagger';

import { MessageViewDto } from './message.view-dto';
import { Message } from '@src/generated/prisma/client';

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
    items: Message[],
    pageSize: number,
    totalCount: number,
    notReadCount: number,
  ): GetDialogueViewDto {
    return {
      pageSize,
      totalCount,
      notReadCount,

      items: items.map(
        MessageViewDto.mapToView,
      ),
    };
  }
}
