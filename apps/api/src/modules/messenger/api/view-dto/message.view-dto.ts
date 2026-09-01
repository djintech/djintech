import { MessageStatus, MessageType } from "@src/generated/prisma/enums";


export class MessageViewDto {
  id!: number;
  ownerId!: number;
  receiverId!: number;
  messageText!: string | null;
  status!: MessageStatus;
  messageType!: MessageType;
  createdAt!: Date;
  updatedAt!: Date;
}
