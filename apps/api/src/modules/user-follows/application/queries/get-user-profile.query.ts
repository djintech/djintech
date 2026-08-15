import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserProfileViewDto } from '../../api/view-dto/user-profile-view.dto';
import { ProfileQueryRepository } from '../../infrastructure/query/profile.query.repository';
import { FileUrlService } from '@src/core/file/file-url.service';

export class GetUserProfileQuery {
  constructor(
    public readonly currentUserId: number,
    public readonly userName: string,
  ) {}
}

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileQueryHandler
  implements IQueryHandler<GetUserProfileQuery>
{
  constructor(
    private readonly profileQueryRepository: ProfileQueryRepository,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async execute({ currentUserId, userName}: GetUserProfileQuery ): Promise<UserProfileViewDto> {
    const result = await this.profileQueryRepository.getUserProfile( currentUserId, userName );

    return {
      id: result.id,
      userName: result.userName,
      firstName: result.firstName,
      lastName: result.lastName,
      city: result.city,
      country: result.country,
      dateOfBirth: result.dateOfBirth,
      aboutMe: result.aboutMe,      
      avatar: result.avatar ? this.fileUrlService.getPublicUrl(result.avatar) : null,
      
      followersCount: result.followersCount,
      followingCount: result.followingCount,
      publicationsCount: result.publicationsCount,
      isFollowing: result.isFollowing,
      isFollowedBy: result.isFollowedBy,
    };
  }
}
