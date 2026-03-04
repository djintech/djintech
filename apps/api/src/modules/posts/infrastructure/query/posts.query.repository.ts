import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Post } from '@src/generated/prisma/client';

@Injectable()
export class PostsQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPostById(id: number): Promise<Post | null>   {
    return this.prisma.post.findUnique({
      where: { id, deletedAt: null }
    });
  }

}