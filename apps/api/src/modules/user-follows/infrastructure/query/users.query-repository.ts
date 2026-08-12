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
  prevCursor: number;
  nextCursor: number | null;
  pageSize: number;
};

@Injectable()
export class UsersQueryRepository {
  constructor(private prisma: PrismaService) {}

  async searchUsers(
    params: SearchUsersParams,
  ): Promise<SearchUsersResult> {
    const {
      username,
      cursor = 0,
      pageSize,
    } = params;

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

      ...(cursor > 0
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
      prevCursor: cursor,
      nextCursor: hasNextPage
        ? items[items.length - 1]?.id ?? null
        : null,
      pageSize,
    };
  }
}
