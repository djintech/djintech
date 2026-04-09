import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { ProfilesQueryRepository } from '@modules/user-accounts/profile/infrastructure/query/profiles.query.repository';
import { UserDataViewDto } from '@modules/user-accounts/profile/api/view-dto/user-data.view-dto';
import { FileUrlService } from '@core/file/file-url.service';
import { AvatarViewDto } from '@modules/user-accounts/profile/api/view-dto/avatar.view-dto';

export class GetProfileDataByIdQuery {
  constructor(public readonly id: number) {}
}

@QueryHandler(GetProfileDataByIdQuery)
export class GetProfileDataByIdQueryHandler implements IQueryHandler<GetProfileDataByIdQuery> {
  constructor(
    private readonly profilesQueryRepository: ProfilesQueryRepository,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async execute({ id }: GetProfileDataByIdQuery) {
    const user = await this.profilesQueryRepository.getUserDataByIdOrNull(id);
    let buildUrl;
    let avatarLink;

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User does not exist',
        extensions: [{ message: 'User not found', field: 'id' }],
      });
    }

    if (user.avatar) {
      buildUrl = this.fileUrlService.getPublicUrl.bind(this.fileUrlService);
      avatarLink = AvatarViewDto.mapToView(user.avatar, buildUrl);
    }

    return UserDataViewDto.mapToView(user, avatarLink);
  }
}
