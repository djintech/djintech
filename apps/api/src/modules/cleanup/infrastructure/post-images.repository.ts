import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { PostImage } from '@src/generated/prisma/client';

const BATCH_SIZE = 50;

@Injectable()
export class PostImagesRepository {
  constructor(private prisma: PrismaService) {}

  async findImagesForDelete(): Promise<PostImage[]> {
    const deletionThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.prisma.postImage.findMany({
      where: {
        deletedAt: { not: null, lte: deletionThreshold }, // прошло 24 часа
        isDeletedFromS3: false,
      },
      take: BATCH_SIZE,
      orderBy: {
        deletedAt: 'asc',
      },
    });
  }

  async markAsDeleted(ids: number[]) {
    return this.prisma.postImage.updateMany({
      where: {
        id: { in: ids },
        isDeletedFromS3: false,
      },
      data: {
        isDeletedFromS3: true,
      },
    });
  }
}
