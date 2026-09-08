import { ApiProperty } from '@nestjs/swagger';
import { MessageViewDto } from './message.view-dto';
import { ChatQueryResult } from '../../infrastructure/types/chat-query-result';

export class MessengerChatViewDto extends MessageViewDto {
  @ApiProperty({
    example: 'alex',
  })
  userName!: string;

  @ApiProperty({
    type: String, nullable: true, 
  })
  avatar!: string | null;

  @ApiProperty({
    example: 2,
  })
  notReadCount!: number;
}
