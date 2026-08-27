import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { CommentLike, LikeCommentStatus,  } from '@src/generated/prisma/client';

@Injectable()
export class CommentLikesRepository {
  constructor(private prisma: PrismaService) {}

  async upsert( commentId: number, userId: number, status: LikeCommentStatus ): Promise<CommentLike> {
    return this.prisma.commentLike.upsert({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
      create: {
        commentId,
        userId,
        status,
      },
      update: {
        status,
      },
    });
  }
}
