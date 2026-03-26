import { Injectable } from '@nestjs/common';
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

}