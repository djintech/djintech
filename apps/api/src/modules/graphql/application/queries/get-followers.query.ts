import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFollowUsersInput } from '../../dto/get-follow.input';
import { FollowersPaginatedView } from '../../dto/followers-paginated.view';
import { UserFollowQueryRepository } from '../../infrastructure/queries/user-follow.query.repository';

export class GetFollowersQuery {
  constructor(
    public query: GetFollowUsersInput
  ) {}
}

@QueryHandler(GetFollowersQuery)
export class GetFollowersQueryHandler implements IQueryHandler<GetFollowersQuery, FollowersPaginatedView> {
  constructor(
    private readonly userFollowQueryRepository: UserFollowQueryRepository,
  ) {}

  async execute({ query}: GetFollowersQuery): Promise<FollowersPaginatedView> {
    const { userId, pageSize, pageNumber, sortBy, sortDirection } = query;
    return this.userFollowQueryRepository.getFollowers({ userId, pageSize, pageNumber, sortBy, sortDirection });
  }
}
