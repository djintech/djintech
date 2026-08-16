import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Prisma } from '@src/generated/prisma/browser';
import { SortDirection } from '../../dto/sort-direction.enum';
import { FollowersSortBy } from '../../dto/followers-sort-by.enum';

export type FollowUser = {
  id: number;
  userId: number;
  userName: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;};

export type FollowsUsersResult = {
  totalCount: number;
  pagesCount: number;
  pageSize: number;
  page: number;
  items: FollowUser[];
};

type FollowListDirection = 'followers' | 'following';

type GetFollowUsersParams = {
  userId: number;
  pageSize: number;
  pageNumber: number;
  sortBy: FollowersSortBy;
  sortDirection: SortDirection;
};

@Injectable()
export class UserFollowQueryRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getFollowers( params: GetFollowUsersParams ): Promise<FollowsUsersResult> {
    return this.getFollowUsers( params, 'followers');
  }

  async getFollowing( params: GetFollowUsersParams ): Promise<FollowsUsersResult> {
    return this.getFollowUsers( params, 'following' );
  }

  private async getFollowUsers( params: GetFollowUsersParams, direction: FollowListDirection ): Promise<FollowsUsersResult> {
    const { userId, pageSize, pageNumber, sortBy, sortDirection } = params;

    const where: Prisma.UserFollowWhereInput =
      direction === 'followers'
        ? { followingId: userId, follower: { deletedAt: null }}
        : { followerId: userId, following: { deletedAt: null }};

    const totalCount = await this.prisma.userFollow.count({ where });

    const pagesCount = Math.ceil(totalCount / pageSize);
    const skip = (pageNumber - 1) * pageSize;
    const directionValue = sortDirection === SortDirection.Asc ? 'asc' : 'desc';

    const orderBy: Prisma.UserFollowOrderByWithRelationInput =
      sortBy === FollowersSortBy.USERNAME
        ? direction === 'followers'
          ? { follower: { username: directionValue }}
          : { following: { username: directionValue }}
        : { createdAt: directionValue };

    const items = await this.prisma.userFollow.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      select: {
        id: true,
        createdAt: true,

        follower: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },

        following: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const followUsers: FollowUser[] = items.map((follow) => {
      const user = direction === 'followers' ? follow.follower : follow.following;

      return {
        id: follow.id,
        userId: user.id,
        userName: user.username,
        firstName: user.profile?.firstName ?? null,
        lastName: user.profile?.lastName ?? null,
        createdAt: follow.createdAt,
      };
    });

    return {
      totalCount,
      pagesCount,
      pageSize,
      page: pageNumber,
      items: followUsers,
    };
  }
}
