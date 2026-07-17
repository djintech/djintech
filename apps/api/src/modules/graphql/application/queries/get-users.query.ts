import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersInput } from '../../dto/get-users.input';
import { UsersPaginatedView } from '../../dto/users-paginated.view';
import { UserView } from '../../dto/user.view';
import { UsersQueryRepository, UserWithProfile } from '../../infrastructure/queries/users.query.repository';

export class GetUsersQuery {
  constructor(public input: GetUsersInput) {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler
  implements IQueryHandler<GetUsersQuery, UsersPaginatedView>
{
  constructor(private usersQueryRepository: UsersQueryRepository) {}

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
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      isBanned: user.isBanned,
      profileId: user.profile?.id || null,
    };
  }
}
