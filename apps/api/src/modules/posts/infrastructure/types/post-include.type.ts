import { Prisma } from '@src/generated/prisma/client';

export const postInclude = {
  postImages: true,
  user: true,

  postLikes: {
    where: {
      status: 'LIKE',
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
    include: {
      user: {
        include: {
          profile: {
            include: {
              avatar: true,
            },
          },
        },
      },
    },
  },

  _count: {
    select: {
      postLikes: {
        where: {
          status: 'LIKE',
        },
      },
    },
  },
} satisfies Prisma.PostInclude;

export type PostFullInfo = Prisma.PostGetPayload<{
  include: typeof postInclude;
}>;
