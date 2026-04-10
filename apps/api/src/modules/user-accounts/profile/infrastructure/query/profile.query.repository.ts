import { Injectable } from "@nestjs/common";
import { PrismaService } from "@src/db/prisma.service";
import { Prisma } from "@src/generated/prisma/client";

export type ProfileFullInfo = Prisma.ProfileGetPayload<{
  include: {
    avatar: true;
    user: true;
  };
}>;

@Injectable()
export class ProfileQueryRepository {
  constructor(private prisma: PrismaService) {}

  async findyUserId( userId: number ): Promise<ProfileFullInfo | null> {
    return this.prisma.profile.findFirst(
      { 
        where: { userId, deletedAt: null },
        include: { avatar: true, user: true }
      },      
    )
  }
}