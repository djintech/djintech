import { MessageMediaType, MessageStatus, MessageType } from '@src/generated/prisma/enums';

export type ChatQueryResult = {
  id: number;
  ownerId: number;
  receiverId: number;
  messageText: string | null;
  status: MessageStatus;
  messageType: MessageType;
  createdAt: Date;
  updatedAt: Date;

  userName: string;
  avatarUrl: string | null;

  notReadCount: number;

  mediaKey: string | null;
  mediaMimeType: string | null;
  mediaSize: number | null;
  mediaFileType: MessageMediaType | null;
};
