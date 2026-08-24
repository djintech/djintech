import { Injectable } from '@nestjs/common';
import { SortDirection } from '@src/core/dto/base.query-params.input-dto';
import { PrismaService } from '@src/db/prisma.service';
import { AnswerForView, CommentForView } from '../comments.repository';
import { LikeCommentStatus } from '@src/generated/prisma/enums';
import { Prisma } from '@src/generated/prisma/client';

@Injectable()
export class CommentsQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCommentByIdAndPostId(id: number, postId: number): Promise<{ id: number; } | null>   {
    return this.prisma.comment.findFirst({
      where: { id, postId, deletedAt: null },
      select: { id: true }
    });
  }

  async getAll({ order, skip, pageSize, postId, userId }
    :{order: SortDirection, skip: number, pageSize: number, postId: number, userId: number }
  ): Promise<{comments: CommentForView[], totalCount: number }> {
    const sortDirection = order === SortDirection.Asc ? Prisma.sql`ASC` : Prisma.sql`DESC`;
    /*
     * Сначала получаем только ID комментариев уже в нужном порядке.
     *
     * 1. Собственные комментарии текущего пользователя — первыми.
     * 2. Внутри каждой группы — по createdAt.
     * 3. id используется как дополнительная стабильная сортировка.
     *
     * Берём только комментарии верхнего уровня: parentId IS NULL.
     */
    const commentIds = await this.prisma.$queryRaw<Array<{ id: number }>>(
      Prisma.sql`
        SELECT c."id"
        FROM "comments" c
        WHERE c."postId" = ${postId}
          AND c."deletedAt" IS NULL
          AND c."parentId" IS NULL
        ORDER BY
          CASE
            WHEN c."userId" = ${userId} THEN 0
            ELSE 1
          END ASC,
          c."createdAt" ${sortDirection},
          c."id" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${skip}
      `,
    );

    /*
     * Общее количество комментариев.
     *
     * userId здесь не учитываем, потому что собственные комментарии
     * не являются фильтром — они просто имеют более высокий приоритет
     * при сортировке.
     */
    const totalCount = await this.prisma.comment.count({
      where: {
        postId,
        parentId: null,
        deletedAt: null,
      },
    });

    if (commentIds.length === 0) {
      return {
        comments: [],
        totalCount,
      };
    }

    const ids = commentIds.map(({ id }) => id);

    /*
     * Получаем полную информацию по комментариям.
     */
    const comments = await this.prisma.comment.findMany({
      where: {
        id: {
          in: ids,
        },
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

        /*
         * Количество ответов и лайков.
         */
        _count: {
          select: {
            replies: {
              where: {
                deletedAt: null,
              },
            },

            commentLikes: {
              where: {
                status: LikeCommentStatus.LIKE,
              },
            },
          },
        },

        /*
         * Проверяем, поставил ли текущий пользователь лайк.
         */
        commentLikes: {
          where: {
            userId,
            status: LikeCommentStatus.LIKE,
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    /*
     * findMany с IN (...) не гарантирует порядок.
     *
     * Поэтому восстанавливаем порядок, который получили
     * на первом SQL-запросе.
     */
    const commentsMap = new Map(
      comments.map((comment) => [comment.id, comment]),
    );

    const orderedComments: CommentForView[] = ids
      .map((id) => commentsMap.get(id))
      .filter(
        (
          comment,
        ): comment is (typeof comments)[number] => comment !== undefined,
      )
      .map((comment) => ({
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
      }));

    return {
      comments: orderedComments,
      totalCount,
    };
  }

  async getAllAnswers({ order, skip, pageSize, postId, parentId, userId }
    :{order: SortDirection, skip: number, pageSize: number, postId: number, parentId: number, userId: number }
  ): Promise<{answers: AnswerForView[], totalCount: number }> {
    const sortDirection = order === SortDirection.Asc ? Prisma.sql`ASC` : Prisma.sql`DESC`;
    /*
     * Сначала получаем только ID ответов комментариев уже в нужном порядке.
     *
     * 1. Собственные ответы текущего пользователя — первыми.
     * 2. Внутри каждой группы — по createdAt.
     * 3. id используется как дополнительная стабильная сортировка.
     *
     */
    const answersIds = await this.prisma.$queryRaw<Array<{ id: number }>>(
      Prisma.sql`
        SELECT c."id"
        FROM "comments" c
        WHERE c."postId" = ${postId}
          AND c."deletedAt" IS NULL
          AND c."parentId" = ${parentId}
        ORDER BY
          CASE
            WHEN c."userId" = ${userId} THEN 0
            ELSE 1
          END ASC,
          c."createdAt" ${sortDirection},
          c."id" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${skip}
      `,
    );

    /*
     * Общее количество.
     *
     * userId здесь не учитываем, потому что собственные комментарии
     * не являются фильтром — они просто имеют более высокий приоритет при сортировке.
     */
    const totalCount = await this.prisma.comment.count({
      where: {
        postId,
        parentId,
        deletedAt: null,
      },
    });

    if (answersIds.length === 0) {
      return {
        answers: [],
        totalCount,
      };
    }

    const ids = answersIds.map(({ id }) => id);

    /*
     * Получаем полную информацию по ответам.
     */
    const answers = await this.prisma.comment.findMany({
      where: {
        id: {
          in: ids,
        },
        postId,
        parentId,
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

        /*
         * Количество лайков.
         */
        _count: {
          select: {
            commentLikes: {
              where: {
                status: LikeCommentStatus.LIKE,
              },
            },
          },
        },

        /*
         * Проверяем, поставил ли текущий пользователь лайк.
         */
        commentLikes: {
          where: {
            userId,
            status: LikeCommentStatus.LIKE,
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    /*
     * findMany с IN (...) не гарантирует порядок.
     *
     * Поэтому восстанавливаем порядок, который получили
     * на первом SQL-запросе.
     */
    const answersMap = new Map(
      answers.map((answer) => [answer.id, answer]),
    );

    const orderedAnswers: AnswerForView[] = ids
      .map((id) => answersMap.get(id))
      .filter(
        (
          answer,
        ): answer is (typeof answers)[number] =>
          answer !== undefined && answer.parentId !== null,
      )
      .map((answer) => {
        if (answer.parentId === null) {
          throw new Error('Answer parentId cannot be null');
        }

        return { 
          id: answer.id,
          parentId: answer.parentId,
          content: answer.content,
          createdAt: answer.createdAt,

          user: {
            id: answer.user.id,
            username: answer.user.username,
            avatarKey: answer.user.profile?.avatar?.key ?? null,
          },

          likeCount: answer._count.commentLikes,
          isLiked: answer.commentLikes.length > 0,
        }
      });

    return {
      answers: orderedAnswers,
      totalCount,
    };
  }
}