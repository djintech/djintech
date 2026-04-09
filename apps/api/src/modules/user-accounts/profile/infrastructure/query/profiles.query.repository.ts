import { PrismaService } from '@src/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@src/generated/prisma/client';

export type UserFullInfo = Prisma.ProfileGetPayload<{
  include: {
    user: true;
    avatar: true;
  };
}>;

@Injectable()
export class ProfilesQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserDataByIdOrNull(userId: number): Promise<UserFullInfo | null> {
    return this.prisma.profile.findUnique({
      where: { userId, deletedAt: null },
      include: { user: true, avatar: true },
    });
  }
}
