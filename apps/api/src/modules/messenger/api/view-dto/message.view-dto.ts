import { ApiProperty } from "@nestjs/swagger";
import { Message } from "@src/generated/prisma/client";
import { MessageStatus, MessageType } from "@src/generated/prisma/enums";

export class MessageViewDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  ownerId!: number;

  @ApiProperty()
  receiverId!: number;

  @ApiProperty()
  messageText!: string | null;

  @ApiProperty({ enum: MessageStatus })
  status!: MessageStatus;

  @ApiProperty({ enum: MessageType })
  messageType!: MessageType;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static mapToView( message: Message ): MessageViewDto {
    return {
      id: message.id,
      ownerId: message.ownerId,
      receiverId: message.receiverId,
      messageText: message.messageText,
      status: message.status,
      messageType: message.messageType,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}
