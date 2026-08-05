import { Injectable } from '@nestjs/common';
import { SortDirection } from '@src/core/dto/base.query-params.input-dto';
import { PrismaService } from '@src/db/prisma.service';
import { Prisma } from '@src/generated/prisma/client';
import { PostsSortBy } from '../../dto/posts-sort-by.enum';

export type PostFullInfo = Prisma.PostGetPayload<{
  include: {
    postImages: true;
    user: {
      include: {
        profile: {
          include: { avatar: true };
        };
      };
    };
  };
}>;

@Injectable()
export class PostsQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll({ endCursorPostId, pageSize, searchTerm, sortDirection, sortBy }: {
    endCursorPostId?: number; pageSize: number; searchTerm?: string; sortDirection: SortDirection; sortBy: PostsSortBy;
  }): Promise<{ posts: PostFullInfo[]; totalCount: number; }> {
    const where: Prisma.PostWhereInput = {
      deletedAt: null,
      ...(searchTerm?.trim()
        ? {
            user: {
              username: {
                contains: searchTerm.trim(),
                mode: 'insensitive',
              },
            },
          }
        : {}),
      ...(endCursorPostId
        ? {
            id:
              sortDirection === SortDirection.Desc
                ? { lt: endCursorPostId }
                : { gt: endCursorPostId },
          }
        : {}),
    };

    const orderDirection = sortDirection === SortDirection.Asc ? 'asc' : 'desc';

    const orderBy: Prisma.PostOrderByWithRelationInput =
      sortBy === PostsSortBy.USERNAME
        ? { user: { username: orderDirection }}
        : {createdAt: orderDirection };

    const [posts, totalCount] =
      await Promise.all([ this.prisma.post.findMany({
          where,
          take: pageSize,
          orderBy,
          include: {
            postImages: {
              where: { deletedAt: null },
              orderBy: { position: 'asc' },
            },

            user: {
              include: {
                profile: {
                  include: {
                    avatar: {
                      where: { deletedAt: null },
                    },
                  },
                },
              },
            },
          },
        }),

        this.prisma.post.count({ where }),
      ]);

    return { posts,  totalCount };
  }
}