import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';

@Injectable()
export class ProfileQueryRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getUserProfile( currentUserId: number, userId: number ) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null, },
      include: {
        profile: {
          where: { deletedAt: null },
          include: {
            avatar: {
              where: { deletedAt: null, },
            },
          },
        },
      },
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found', extensions: [{ message: 'User not found', field: 'userName' }],
      });
    }

    const [ followersCount, followingCount, publicationsCount, isFollowing, isFollowedBy, ] = await Promise.all([
      this.prisma.userFollow.count({ where: { followingId: user.id }}),
      this.prisma.userFollow.count({ where: { followerId: user.id }}),
      this.prisma.post.count({ where: { userId: user.id, deletedAt: null }}),     

      this.prisma.userFollow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId, followingId: user.id }},
        select: {id: true },
      }),

      this.prisma.userFollow.findUnique({
        where: { followerId_followingId: { followerId: user.id, followingId: currentUserId }},
        select: { id: true },
      }),
    ]);

    return {
      id: user.id,
      userName: user.username,
      firstName: user.profile?.firstName ?? null,
      lastName: user.profile?.lastName ?? null,
      city: user.profile?.city ?? null,
      country: user.profile?.country ?? null,
      dateOfBirth: user.profile?.dateOfBirth ?? null,
      aboutMe: user.profile?.aboutMe ?? null,

      avatar: user.profile?.avatar?.key ?? null,

      isFollowing: !!isFollowing,
      isFollowedBy: !!isFollowedBy,

      followingCount,
      followersCount,
      publicationsCount,
    };
  }

}
