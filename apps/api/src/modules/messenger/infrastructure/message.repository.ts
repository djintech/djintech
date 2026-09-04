import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Message } from '@src/generated/prisma/client';
import { MessageStatus, MessageType } from '@src/generated/prisma/enums';

@Injectable()
export class MessageRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findById(id: number): Promise<Message | null> {
    return this.prisma.message.findUnique({
      where: { id },
    });
  }

  async createMessage(params: {
    ownerId: number;
    receiverId: number;
    messageText: string;
  }): Promise<Message> {
    return this.prisma.message.create({
      data: {
        ownerId: params.ownerId,
        receiverId: params.receiverId,
        messageText: params.messageText,
        messageType: MessageType.TEXT,
        status: MessageStatus.SENT,
      },
    });
  }

  async updateStatus(
    id: number,
    status: MessageStatus,
  ): Promise<Message> {
    return this.prisma.message.update({
      where: { id },
      data: {
        status,
      },
    });
  }
}
