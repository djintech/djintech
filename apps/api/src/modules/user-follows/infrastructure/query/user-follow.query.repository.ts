import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Prisma, User } from '@src/generated/prisma/browser';

export type FollowUser = {
  id: number;
  userId: number;
  userName: string;
  createdAt: Date;
  avatarKey: string | null;
  isFollowing: boolean;
  isFollowedBy: boolean;
};

export type FollowsUsersResult = {
  totalCount: number;
  pagesCount: number;
  pageSize: number;
  prevCursor: number | null;
  nextCursor: number | null;
  items: FollowUser[];
};

type FollowListDirection = 'followers' | 'following';

type GetFollowUsersParams = {
  currentUserId: number;
  targetUserId: number;
  search?: string;
  pageSize: number;
  cursor?: number;
};

@Injectable()
export class UserFollowQueryRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findUserByUsername( userName: string ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { username: userName, deletedAt: null}
    });
  }

  async getFollowers( params: GetFollowUsersParams ): Promise<FollowsUsersResult> {
    return this.getFollowUsers( params, 'followers');
  }

  async getFollowing( params: GetFollowUsersParams ): Promise<FollowsUsersResult> {
    return this.getFollowUsers( params, 'following' );
  }

  private async getFollowUsers( params: GetFollowUsersParams, direction: FollowListDirection ): Promise<FollowsUsersResult> {
    const { currentUserId, targetUserId, search, pageSize, cursor } = params;

    const where: Prisma.UserFollowWhereInput =
      direction === 'followers'
        ? {
            followingId: targetUserId,
            ...(search
              ? {
                  follower: {
                    username: { contains: search, mode: 'insensitive' },
                    deletedAt: null,
                  },
                }
              : {}),
          }
        : {
            followerId: targetUserId,
            ...(search
              ? {
                  following: {
                    username: { contains: search, mode: 'insensitive' },
                    deletedAt: null,
                  },
                }
              : {}),
          };

    const [totalCount, follows] = await Promise.all([
      this.prisma.userFollow.count({ where }),
      this.prisma.userFollow.findMany({
        where,

        select: {
          id: true,
          createdAt: true,

          follower: {
            select: { 
              id: true, 
              username: true,
              profile: {
                where: { deletedAt: null },
                select: {
                  avatar: {
                    where: { deletedAt: null },
                    select: { key: true },
                  },
                },
              },
            },
          },

          following: {
            select: {
              id: true,
              username: true,
              profile: {
                where: { deletedAt: null },
                select: {
                  avatar: {
                    where: { deletedAt: null },
                    select: { key: true },
                  },
                },
              },
            },
          },
        },

        orderBy: { id: 'desc' },

        ...(cursor
          ? { skip: 1, cursor: { id: cursor } }
          : {}),

        take: pageSize + 1,
      }),
    ]);

    const hasNextPage = follows.length > pageSize;

    const items = hasNextPage ? follows.slice(0, pageSize) : follows;

    const userIds = items.map((follow) =>
      direction === 'followers' ? follow.follower.id : follow.following.id,
    );

    const statuses = await this.getFollowStatuses( currentUserId, userIds );

    return {
      totalCount,
      pagesCount: Math.ceil(totalCount / pageSize),
      pageSize,
      prevCursor: cursor ?? null,
      nextCursor: hasNextPage ? items[items.length - 1]?.id ?? null : null,

      items: items.map((follow) => {
        const user = direction === 'followers' ? follow.follower : follow.following;
        const status = statuses.get(user.id);
        return {
          id: user.id,
          userId: user.id,
          userName: user.username,
          createdAt: follow.createdAt,
          avatarKey: user.profile?.avatar?.key ?? null,
          isFollowing: status?.isFollowing ?? false,
          isFollowedBy: status?.isFollowedBy ?? false,
        };
      }),
    };
  }

  private async getFollowStatuses( currentUserId: number, userIds: number[] ) {
    if (userIds.length === 0) {
      return new Map<
        number,
        {
          isFollowing: boolean;
          isFollowedBy: boolean;
        }
      >();
    }

    const follows = await this.prisma.userFollow.findMany({
      where: {
        OR: [
          {
            followerId: currentUserId,
            followingId: { in: userIds },
          },
          {
            followingId: currentUserId,
            followerId: { in: userIds },
          },
        ],
      },

      select: {
        followerId: true,
        followingId: true,
      },
    });

    const userIdSet = new Set(userIds);

    const statuses = new Map<
      number,
      {
        isFollowing: boolean;
        isFollowedBy: boolean;
      }
    >();

    for (const userId of userIds) {
      statuses.set(userId, {
        isFollowing: false,
        isFollowedBy: false,
      });
    }

    for (const follow of follows) {
      if (
        follow.followerId === currentUserId &&
        userIdSet.has(follow.followingId)
      ) {
        statuses.get(follow.followingId)!.isFollowing = true;
      }

      if (
        follow.followingId === currentUserId &&
        userIdSet.has(follow.followerId)
      ) {
        statuses.get(follow.followerId)!.isFollowedBy = true;
      }
    }

    return statuses;
  }
}
