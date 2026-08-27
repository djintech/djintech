import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { LikeCommentStatus } from '@src/generated/prisma/enums';
import { LikesResult } from '../types/likes-result.type';

@Injectable()
export class CommentLikesQueryRepository {
  constructor(private prisma: PrismaService) {}

  async getCommentLikes( { commentId, currentUserId, pageSize, cursor}
    : {commentId: number, currentUserId: number, pageSize: number, cursor: number}
   ): Promise<LikesResult> {
    const likes = await this.prisma.commentLike.findMany({
      where: {
        commentId,
        status: LikeCommentStatus.LIKE,

        ...(cursor > 0 ? { id: { lt: cursor, } } : {}),
      },

      orderBy: { id: 'desc' },
      // Берём +1 запись, чтобы определить наличие следующей страницы
      take: pageSize + 1,

      select: {
        id: true,
        userId: true,
        createdAt: true,

        user: {
          select: {
            username: true,

            profile: {
              where: {
                deletedAt: null,
              },
              select: {
                avatar: {
                  where: {
                    deletedAt: null,
                  },
                  select: {
                    key: true,
                  },
                },
              },
            },
            // Текущий пользователь подписан на пользователя, который поставил лайк
            followers: {
              where: { followerId: currentUserId },
              select: { id: true },
              take: 1,
            },

            // Пользователь, который поставил лайк,  подписан на текущего пользователя
            following: {
              where: { followingId: currentUserId },
              select: { id: true },
              take: 1,
            },
          },
        },
      },
    });

    const hasNextPage = likes.length > pageSize;
    const items = hasNextPage ? likes.slice(0, pageSize) : likes;
    const nextCursor = hasNextPage && items.length > 0 ? items[items.length - 1].id : null;

    return {
      pageSize,
      prevCursor: cursor,
      nextCursor,

      items: items.map((like) => ({
        id: like.id,
        userId: like.userId,
        userName: like.user.username,
        createdAt: like.createdAt,

        avatarKey: like.user.profile?.avatar?.key ?? null,
        
        isFollowing: like.user.followers.length > 0,
        isFollowedBy: like.user.following.length > 0,
      })),
    };
  }
}
