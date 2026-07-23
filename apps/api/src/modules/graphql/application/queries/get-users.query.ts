import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersInput } from '../../dto/get-users.input';
import { UsersPaginatedView } from '../../dto/users-paginated.view';
import { UserView } from '../../dto/user.view';
import { UsersQueryRepository, UserWithProfile } from '../../infrastructure/queries/users.query.repository';
import { FileUrlService } from '@src/core/file/file-url.service';

export class GetUsersQuery {
  constructor(public input: GetUsersInput) {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler
  implements IQueryHandler<GetUsersQuery, UsersPaginatedView>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly fileUrlService: FileUrlService
  ) {}

  async execute({ input }: GetUsersQuery): Promise<UsersPaginatedView> {
    const { pageNumber, pageSize } = input;
    const skip = input.calculateSkip();

    const { users, totalCount } = await this.usersQueryRepository.getUsers({
      skip,
      pageSize,
      searchTerm: input.searchTerm,
      sortBy: input.sortBy,
      sortDirection: input.sortDirection,
      statusFilter: input.statusFilter,
    });

    const pagesCount = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);

    return {
      items: users.map((user) => this.mapToUserView(user)),
      totalCount,
      pagesCount,
      page: pageNumber,
      pageSize,
    };
  }

  private mapToUserView(user: UserWithProfile): UserView {
    const profile = user.profile;
    const buildUrl = this.fileUrlService.getPublicUrl.bind(this.fileUrlService);

    return {
      id: user.id,
      userName: user.username,
      email: user.email,
      createdAt: user.createdAt,
      profile: {
        id: profile!.id,
        userName: user.username,
        firstName: profile!.firstName,
        lastName: profile!.lastName,
        city: profile!.city,
        country: profile!.country,
        dateOfBirth: profile!.dateOfBirth,
        aboutMe: profile!.aboutMe,
        createdAt: profile!.createdAt,
        avatar: profile!.avatar?.key ? buildUrl(profile!.avatar.key) : null,
      },
      userBan:
        user.isBanned && user.banReason && user.banDate
          ? {
              reason: user.banReason,
              createdAt: user.banDate,
            }
          : null,
    };
  }
}
