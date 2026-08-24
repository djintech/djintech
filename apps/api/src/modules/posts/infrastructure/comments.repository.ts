import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Comment, LikeCommentStatus } from '@src/generated/prisma/client';

export type CommentForView = {
  id: number;
  postId: number;
  content: string;
  createdAt: Date;

  user: {
    id: number;
    username: string;
    avatarKey: string | null;
  };

  answerCount: number;
  likeCount: number;
  isLiked: boolean;
};

export type AnswerForView = {
  id: number;
  parentId: number;
  content: string;
  createdAt: Date;

  user: {
    id: number;
    username: string;
    avatarKey: string | null;
  };

  likeCount: number;
  isLiked: boolean;
};

@Injectable()
export class CommentsRepository {
  constructor(private prisma: PrismaService) {}

  async create({ content, userId, postId, parentId }: {content: string, userId: number, postId: number, parentId?: number | null,}): Promise<Comment> {
    return this.prisma.comment.create({
       data: { content, userId, postId, parentId: parentId ?? null },
    });
  }

  async findCommentByIdAndPostId(id: number, postId: number): Promise<{ id: number; } | null>   {
    return this.prisma.comment.findFirst({
      where: { id, postId, deletedAt: null },
      select: { id: true }
    });
  }

  /**
   * Returns a comment with all data required to build CommentViewDto.
   * likeCount: number of active LIKEs only.
   * isLiked: whether current user has an active LIKE on this comment.
   * answerCount: number of direct replies to this comment.
   */
  async findByIdForView( commentId: number, currentUserId: number ): Promise<CommentForView | null> {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        deletedAt: null,
      },

      select: {
        id: true,
        postId: true,
        content: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            username: true,

            profile: {
              select: {
                avatar: {
                  select: {
                    key: true,
                  },
                },
              },
            },
          },
        },

        _count: {
          select: {
            replies: {
              where: { deletedAt: null },
            },

            commentLikes: {
              where: { status: LikeCommentStatus.LIKE },
            },
          },
        },

        commentLikes: {
          where: {
            userId: currentUserId,
            status: LikeCommentStatus.LIKE,
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!comment) {
      return null;
    }

    return {
      id: comment.id,
      postId: comment.postId,
      content: comment.content,
      createdAt: comment.createdAt,

      user: {
        id: comment.user.id,
        username: comment.user.username,
        avatarKey: comment.user.profile?.avatar?.key ?? null,
      },

      answerCount: comment._count.replies,
      likeCount: comment._count.commentLikes,
      isLiked: comment.commentLikes.length > 0,
    };
  }

  async findAnswerByIdForView( answerId: number, currentUserId: number ): Promise<AnswerForView | null> {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: answerId,
        parentId: { not: null },
        deletedAt: null,
      },

      select: {
        id: true,
        parentId: true,
        content: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            username: true,

            profile: {
              select: {
                avatar: {
                  select: {
                    key: true,
                  },
                },
              },
            },
          },
        },

        _count: {
          select: {
            commentLikes: {
              where: { status: LikeCommentStatus.LIKE },
            },
          },
        },

        commentLikes: {
          where: {
            userId: currentUserId,
            status: LikeCommentStatus.LIKE,
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!comment || !comment.parentId ) {
      return null;
    }

    return {
      id: comment.id,
      parentId: comment.parentId,
      content: comment.content,
      createdAt: comment.createdAt,

      user: {
        id: comment.user.id,
        username: comment.user.username,
        avatarKey: comment.user.profile?.avatar?.key ?? null,
      },

      likeCount: comment._count.commentLikes,
      isLiked: comment.commentLikes.length > 0,
    };
  }
}
