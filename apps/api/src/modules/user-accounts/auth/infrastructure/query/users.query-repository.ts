import { PrismaService } from '@src/db/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserDataByIdOrNull(id: number): Promise<{
    username: string;
    profile: { aboutMe: string | null; avatar: { key: string } | null } | null;
    _count: { posts: number };
  } | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        username: true,

        profile: {
          select: {
            aboutMe: true,
            avatar: {
              select: {
                key: true,
              },
            },
          },
        },

        _count: {
          select: {
            posts: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });
  }
}
