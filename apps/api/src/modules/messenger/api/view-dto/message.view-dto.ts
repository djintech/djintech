import { ApiProperty } from "@nestjs/swagger";
import { FileUrlService } from "@src/core/file/file-url.service";
import { MessageMediaType, MessageStatus, MessageType } from "@src/generated/prisma/enums";
import { MessageWithMedia } from "../../infrastructure/types/message-with-media.type";

export class MediaContentViewDto {
  @ApiProperty({
    enum: MessageMediaType,
    example: MessageMediaType.IMAGE,
  })
  fileType!: MessageMediaType;
  
  @ApiProperty({ type: String, nullable: true })
  fileUrl!: string | null;
}

export class MessageViewDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  ownerId!: number;

  @ApiProperty()
  receiverId!: number;

  @ApiProperty()
  messageText!: string | null;

  @ApiProperty({ type: MediaContentViewDto, nullable: true })
  mediaContent!: MediaContentViewDto | null; 

  @ApiProperty({ enum: MessageStatus })
  status!: MessageStatus;

  @ApiProperty({ enum: MessageType })
  messageType!: MessageType;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static mapToView( message: MessageWithMedia, fileUrlService: FileUrlService  ): MessageViewDto {
    return {
      id: message.id,
      ownerId: message.ownerId,
      receiverId: message.receiverId,
      messageText: message.messageText,

      mediaContent: message.media ? {
        fileType: message.media.fileType,
        fileUrl: message.media.key ? fileUrlService.getPublicUrl(message.media.key) : null,
      } : null,
      
      status: message.status,
      messageType: message.messageType,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}
