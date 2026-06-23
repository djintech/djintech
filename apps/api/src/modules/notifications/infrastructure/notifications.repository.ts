import { Injectable } from '@nestjs/common';
import { SortDirection } from '@src/core/dto/base.query-params.input-dto';
import { PrismaService } from '@src/db/prisma.service';
import { Prisma, NotificationType } from '@src/generated/prisma/client';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.NotificationCreateInput) {
    return this.prisma.notification.create({ data });
  }

  async findByUserIdCursor(
    userId: number,
    cursor: number,
    pageSize: number,
    isRead?: boolean,
    sortDirection: SortDirection = SortDirection.Desc,
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(cursor > 0 ? { id: { lt: cursor } } : {}),
        ...(isRead !== undefined ? { isRead } : {}),
      },
      orderBy: {
        notifyAt: sortDirection,
      },
      take: pageSize,
    });
  }

  async countAll( userId: number, isRead?: boolean ) {
    return this.prisma.notification.count({
      where: {
        userId,
        deletedAt: null,
        ...(isRead !== undefined ? { isRead } : {}),
      },
    });
  }

  async countUnread(userId: number) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
    });
  }

  async markAsRead(userId: number, ids: number[]) {
    if (ids.length === 0) {
      return;
    }

    await this.prisma.notification.updateMany({
      where: {
        userId,
        id: { in: ids },
        deletedAt: null,
      },
      data: {
        isRead: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.notification.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async softDelete(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async existsByTypeAndPeriod(
    userId: number,
    type: NotificationType,
    from: Date,
    to: Date,
  ): Promise<boolean> {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        type,
        createdAt: {
          gte: from,
          lte: to,
        },
        deletedAt: null,
      },
    });

    return count > 0;
  }

  async deleteOlderThan(date: Date) {
    return this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
      },
    });
  }
}
