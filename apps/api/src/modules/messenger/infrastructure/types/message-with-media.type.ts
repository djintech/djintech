import { Prisma } from '@src/generated/prisma/client';

export type MessageWithMedia = Prisma.MessageGetPayload<{
  include: {
    media: true;
  };
}>;
