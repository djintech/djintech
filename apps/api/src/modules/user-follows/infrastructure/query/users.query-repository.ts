import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Prisma } from '@src/generated/prisma/client';

export type SearchUsersParams = {
  username: string;
  cursor?: number;
  pageSize: number;
};

export type SearchUsersResult = {
  items: Prisma.UserGetPayload<{
    include: {
      profile: {
        include: {
          avatar: true;
        };
      };
    };
  }>[];
  nextCursor: number | null;
};

@Injectable()
export class UsersQueryRepository {
  constructor(private prisma: PrismaService) {}

  async searchUsers(
    params: SearchUsersParams,
  ): Promise<SearchUsersResult> {
    const { username, cursor, pageSize } = params;

    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        username: {
          contains: username,
          mode: 'insensitive',
        },
      },

      include: {
        profile: {
          where: {
            deletedAt: null,
          },
          include: {
            avatar: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },

      orderBy: {
        id: 'asc',
      },

      ...(cursor !== undefined
        ? {
            skip: 1,
            cursor: {
              id: cursor,
            },
          }
        : {}),

      take: pageSize + 1,
    });

    const hasNextPage = users.length > pageSize;

    const items = hasNextPage
      ? users.slice(0, pageSize)
      : users;

    return {
      items,
      nextCursor: hasNextPage
        ? items[items.length - 1]?.id ?? null
        : null,
    };
  }
}
