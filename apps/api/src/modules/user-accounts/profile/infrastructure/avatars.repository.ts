import { Injectable } from "@nestjs/common";
import { PrismaService } from "@src/db/prisma.service";

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
}