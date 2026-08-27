import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { LikePostStatus, PostLike } from '@src/generated/prisma/client';

@Injectable()
export class PostLikesRepository {
  constructor(private prisma: PrismaService) {}

  async upsert( postId: number, userId: number, status: LikePostStatus ): Promise<PostLike> {
    return this.prisma.postLike.upsert({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
      create: {
        postId,
        userId,
        status,
      },
      update: {
        status,
      },
    });
  }
}
