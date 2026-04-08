import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { UsersQueryRepository } from '@modules/user-accounts/auth/infrastructure/query/users.query-repository';
import { FilesConfig } from '@src/config/files/files.config';

export class GetProfileDataByIdQuery {
  constructor(public readonly id: number) {}
}

@QueryHandler(GetProfileDataByIdQuery)
export class GetProfileDataByIdQueryHandler implements IQueryHandler<GetProfileDataByIdQuery> {
  constructor(
    private readonly usersQueryRepo: UsersQueryRepository,
    private readonly fileConfig: FilesConfig,
  ) {}

  async execute({ id }: GetProfileDataByIdQuery) {
    const user = await this.usersQueryRepo.getUserDataByIdOrNull(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User does not exist',
        extensions: [{ message: 'User not found', field: 'id' }],
      });
    }

    return this.mapToUserData(user);
  }

  private mapToUserData(user: {
    username: string;
    profile: { aboutMe: string | null; avatar: { key: string } | null } | null;
    _count: { posts: number };
  }) {
    const bucket = this.fileConfig.awsS3Bucket;
    const region = this.fileConfig.awsRegion;
    const key = user.profile?.avatar?.key;

    return {
      username: user.username,
      aboutMe: user.profile?.aboutMe ?? null,
      avatar: key
        ? `https://${bucket}.s3.${region}.amazonaws.com/${key}`
        : null,
      postsCount: user._count.posts,
      followersCount: 0,
      followingCount: 0,
    };
  }
}
