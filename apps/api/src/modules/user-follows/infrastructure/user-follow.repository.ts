import { Injectable } from "@nestjs/common";
import { PrismaService } from "@src/db/prisma.service";

@Injectable()
export class UserFollowRepository {
  constructor(private prisma: PrismaService) {}

   async userExists(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: { id: true },
    });

    return !!user;
  }

  async isFollowing( followerId: number, followingId: number, ): Promise<boolean> {
    const follow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
      select: { id: true, },
    });
    
    return !!follow;
  }

  async followUser( followerId: number, followingId: number, ): Promise<void> {
    await this.prisma.userFollow.create({ data: { followerId, followingId }, });
  }

  async unfollowUser( followerId: number, followingId: number, ): Promise<void> {
    await this.prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }
}