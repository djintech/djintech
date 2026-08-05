import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Post, Prisma } from '@src/generated/prisma/client';
import { UploadFileResponse } from '@libs/contracts/files/upload-file.contract';

@Injectable()
export class PostsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({ data });
  }

  async createPostWithImages( userId: number, description: string | null, images: UploadFileResponse[] ) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          userId,
          description,
          postImages: {
            create: images.map((img, index) => ({
              key: img.key,
              mimeType: img.mimeType,
              size: img.size,
              position: index,
            })),
          },
        },
        include: {
          postImages: true,
          user: {
            include: {
              profile: {
                include: { avatar: true },
              },
            },
          },
        },
      });

      return post;
    });
  }

  async update(id: number, data: Prisma.PostUpdateInput): Promise<Post> {
    return this.prisma.post.update({ where: { id }, data });
  }

  async findById(id: number): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
    });
  }

  async softDelete(id: number) {
    const now = new Date();

    await this.prisma.post.update({
      where: { id, deletedAt: null },
      data: {
        deletedAt: now,
        postImages: {
          updateMany: {
            where: { deletedAt: null },
            data: { deletedAt: now },
          },
        },
      },
    });
  }
}
