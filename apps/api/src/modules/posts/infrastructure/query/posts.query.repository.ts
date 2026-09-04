import { Injectable } from '@nestjs/common';
import { SortDirection } from '@src/core/dto/base.query-params.input-dto';
import { PrismaService } from '@src/db/prisma.service';
import { PostFullInfo, postInclude } from '../types/post-include.type';
import { FeedFullInfo } from '../types/feed.type';
import { CommentForView } from '../comments.repository';
import { LikeCommentStatus } from '@src/generated/prisma/enums';

@Injectable()
export class PostsQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPostById(id: number): Promise<PostFullInfo | null>   {
    return this.prisma.post.findFirst({
      where: { id, deletedAt: null },
      include: postInclude,
    });
  }

  async findPostsByUserId(
    { userId, order, skip, pageSize }: {userId: number, order: SortDirection, skip: number, pageSize: number}
  ): Promise<{posts: PostFullInfo[], totalCount: number }>  {
    const where = { userId, deletedAt: null };

    const [posts, totalCount] = await Promise.all([
        this.prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: order },
        include: postInclude,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { posts, totalCount };
  }

  async getAll(
    { order, skip, pageSize }: {order: SortDirection, skip: number, pageSize: number}
  ): Promise<{posts: PostFullInfo[], totalCount: number }>  {
    const where = { deletedAt: null };

    const [posts, totalCount] = await Promise.all([
        this.prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: order },
        include: postInclude,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { posts, totalCount };
  }

   async getFeed({ userId, cursor, pageSize }: { userId: number; cursor: number; pageSize: number;})
   : Promise<{ posts: FeedFullInfo[]; nextCursor: number | null; }> {
    const posts = await this.prisma.post.findMany({
      where: {
        deletedAt: null,

        user: {
          following: {
            some: {
              followerId: userId,
            },
          },
        },

        ...(cursor > 0 ? { id: { lt: cursor }} : {}),
      },

      orderBy: [{ id: 'desc' }],
      take: pageSize + 1,

      include: postInclude,
    });

    const hasNextPage = posts.length > pageSize;

    const items = hasNextPage
      ? posts.slice(0, pageSize)
      : posts;

    const nextCursor =
      hasNextPage && items.length > 0
        ? items[items.length - 1].id
        : null;

    if (items.length === 0) {
      return {
        posts: [],
        nextCursor: null,
      };
    }
    
    const postIds = items.map((post) => post.id);

    const currentUserLikes = await this.prisma.postLike.findMany({
      where: {
        userId,
        postId: {in: postIds },
        status: 'LIKE',
      },
      select: { postId: true },
    });

    /*Получаем top-level комментарии для постов feed.*/
    const comments = await this.prisma.comment.findMany({
      where: {
        postId: { in: postIds },
        parentId: null,
        deletedAt: null,
      },

      orderBy: [{ createdAt: 'desc' },  {id: 'desc' }],

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
            userId,
            status: LikeCommentStatus.LIKE,
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    const commentsByPostId = new Map<number, CommentForView[]>();

    for (const comment of comments) {
      const postComments = commentsByPostId.get(comment.postId) ?? [];

      postComments.push({
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
      });

      commentsByPostId.set(comment.postId, postComments);
    }

    const likedPostIds = new Set( currentUserLikes.map((like) => like.postId ));

    const feedPosts: FeedFullInfo[] = items.map((post) => ({
      ...post,
      comments: commentsByPostId.get(post.id) ?? [],
      isLikedByCurrentUser: likedPostIds.has(post.id),
    }));

    return {
      posts: feedPosts,
      nextCursor,
    };
  }
}