import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { MessageMediaType, MessageStatus, MessageType } from '@src/generated/prisma/enums';
import { MessageWithMedia } from './types/message-with-media.type';

@Injectable()
export class MessageRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findById(id: number): Promise<MessageWithMedia | null> {
    return this.prisma.message.findUnique({
      where: { id },
      include: { media: true },
    });
  }

  async findByIds(ids: number[]): Promise<MessageWithMedia[]> {
    return this.prisma.message.findMany({
      where: { id: { in: ids }},
      include: {
        media: true,
      },
    });
  }

  async createMessage(params: {
    ownerId: number;
    receiverId: number;
    messageText: string;
  }): Promise<MessageWithMedia> {
    return this.prisma.message.create({
      data: {
        ownerId: params.ownerId,
        receiverId: params.receiverId,
        messageText: params.messageText,
        messageType: MessageType.TEXT,
        status: MessageStatus.SENT,
      },
      include: { media: true },
    });
  }

  async updateStatus(
    id: number,
    status: MessageStatus,
  ): Promise<MessageWithMedia> {
    return this.prisma.message.update({
      where: { id },
      data: {
        status,
      },
      include: { media: true },
    });
  }

  async updateStatuses(
    ids: number[],
    receiverId: number,
    status: MessageStatus,
  ): Promise<MessageWithMedia[]> {
    await this.prisma.message.updateMany({
      where: { id: { in: ids }, receiverId },
      data: { status },
    });

    return this.findByIds(ids);

  }

  async delete(id: number): Promise<MessageWithMedia> {
    return this.prisma.message.delete({
      where: { id },
      include: { media: true },
    });
  }

  async createMessageWithMedia(params: {
  ownerId: number;
  receiverId: number;
  messageText: string | null;
  messageType: MessageType;
  fileType: MessageMediaType;
  key: string;
  mimeType: string;
  size: number;
}): Promise<MessageWithMedia> {
  return this.prisma.message.create({
    data: {
      ownerId: params.ownerId,
      receiverId: params.receiverId,
      messageText: params.messageText,
      messageType: params.messageType,
      status: MessageStatus.SENT,

      media: {
        create: {
          key: params.key,
          mimeType: params.mimeType,
          size: params.size,
          fileType: params.fileType,
        },
      },
    },

    include: {
      media: true,
    },
  });
}
}
