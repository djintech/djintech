import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { SortDirection } from '@src/core/dto/base.query-params.input-dto';
import { UserSortBy } from '../../dto/user-sort-by.enum';
import { UserStatusFilter } from '../../dto/user-status-filter.enum';
import { Prisma } from '@src/generated/prisma/client';

export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    profile: {
      include: {
        avatar: true;
      };
    };
  };
}>;

@Injectable()
export class UsersQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers({
    skip,
    pageSize,
    searchTerm,
    sortBy,
    sortDirection,
    statusFilter,
  }: {
    skip: number;
    pageSize: number;
    searchTerm?: string;
    sortBy: UserSortBy;
    sortDirection: SortDirection;
    statusFilter: UserStatusFilter;
  }): Promise<{ users: UserWithProfile[]; totalCount: number }> {
    const where = this.buildWhereClause(searchTerm, statusFilter);

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: this.buildOrderBy(sortBy, sortDirection),
        include: {
          profile: {
            include: {
              avatar: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, totalCount };
  }

  async getUsersShort(params: {
    ids?: number[];
    searchTerm?: string;
  }): Promise<
    {
      id: number;
      username: string;
      profile: {
        avatar: {
          key: string;
        } | null;
      } | null;
    }[]
  > {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(params.ids && { id: { in: params.ids, }, }),
        ...(params.searchTerm && { username: { contains: params.searchTerm, mode: 'insensitive', }, }),
      },
      select: {
        id: true,
        username: true,
        profile: {
          select: {
            avatar: {
              where: { deletedAt: null },
              select: { key: true, },
            },
          },
        },
      },
    });
  }

  async getUserById(userId: number): Promise<UserWithProfile | null> {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        profile: {
          include: {
            avatar: true,
          },
        },
      },
    });
  }

  private buildWhereClause(
    searchTerm?: string,
    statusFilter?: UserStatusFilter,
  ): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (searchTerm && searchTerm.trim()) {
      where.username = {
        contains: searchTerm.trim(),
        mode: 'insensitive',
      };
    }

    if (statusFilter === UserStatusFilter.BLOCKED) {
      where.isBanned = true;
    } else if (statusFilter === UserStatusFilter.UNBLOCKED) {
      where.isBanned = false;
    }

    return where;
  }

  private buildOrderBy(
    sortBy: UserSortBy,
    sortDirection: SortDirection,
  ): Prisma.UserOrderByWithRelationInput {
    const orderDirection = sortDirection === SortDirection.Asc ? 'asc' : 'desc';

    if (sortBy === UserSortBy.USERNAME) {
      return { username: orderDirection };
    }

    return { createdAt: orderDirection };
  }
}
