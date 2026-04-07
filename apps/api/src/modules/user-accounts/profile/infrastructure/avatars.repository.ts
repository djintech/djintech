import { Injectable } from "@nestjs/common";
import { BATCH_SIZE } from "@src/core/constants";
import { PrismaService } from "@src/db/prisma.service";
import { Avatar } from "@src/generated/prisma/client";

@Injectable()
export class AvatarsRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(profileId: number, data: {
    key: string;
    mimeType: string;
    size: number;
  }) {
    return this.prisma.avatar.upsert({
      where: { profileId },
      update: {
        ...data,
        deletedAt: null,
        isDeletedFromS3: false,
      },
      create: {
        ...data,
        profileId,
      },
    });
  }

  async findByUserId( userId: number ): Promise<Avatar | null> {
    return this.prisma.avatar.findFirst({
      where: {
        profile: {
          userId: userId,
        },
        deletedAt: null,
      },
    });
  }

  async softDelete(avatarId: number): Promise<void> {
    await this.prisma.avatar.update({
      where: { id: avatarId },
      data: {
        deletedAt: new Date(),
        isDeletedFromS3: false
      },
    });
  }

  async findImagesForDelete(): Promise<Avatar[]> {
    const deletionThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.prisma.avatar.findMany({
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

  async markAsDeleted(ids: (number)[]) {
    if (!ids.length) return;

    return this.prisma.avatar.updateMany({
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