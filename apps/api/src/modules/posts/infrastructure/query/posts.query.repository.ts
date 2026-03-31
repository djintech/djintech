import { Injectable } from '@nestjs/common';
import { SortDirection } from '@src/core/dto/base.query-params.input-dto';
import { PrismaService } from '@src/db/prisma.service';
import { Post, Prisma } from '@src/generated/prisma/client';

export type PostFullInfo = Prisma.PostGetPayload<{
  include: {
    postImages: true;
    user: true;
  };
}>;

@Injectable()
export class PostsQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPostById(id: number): Promise<PostFullInfo | null>   {
    return this.prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: { postImages: true, user: true },
    });
  }

  async findPostsByUserId(
    { userId, order, skip, pageSize }: {userId: number, order: SortDirection, skip: number, pageSize: number}
  ): Promise<{posts: PostFullInfo[], totalCount: number }>  {
    const where = { userId, deletedAt: null };

    const [posts, totalCount] = await this.prisma.$transaction([
        this.prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: order },
        include: { postImages: true, user: true },
      }),
      this.prisma.post.count({ where }),
    ]);

    return { posts, totalCount };
  }

}