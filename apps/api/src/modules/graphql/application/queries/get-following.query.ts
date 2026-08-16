import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFollowUsersInput } from '../../dto/get-follow.input';
import { FollowersPaginatedView } from '../../dto/followers-paginated.view';
import { UserFollowQueryRepository } from '../../infrastructure/queries/user-follow.query.repository';

export class GetFollowingQuery {
  constructor(
    public query: GetFollowUsersInput
  ) {}
}

@QueryHandler(GetFollowingQuery)
export class GetFollowingQueryHandler implements IQueryHandler<GetFollowingQuery, FollowersPaginatedView> {
  constructor(
    private readonly userFollowQueryRepository: UserFollowQueryRepository,
  ) {}

async execute({ query }: GetFollowingQuery): Promise<FollowersPaginatedView> {
    const { userId, pageSize, pageNumber, sortBy, sortDirection } = query;
    return this.userFollowQueryRepository.getFollowing({ userId, pageSize, pageNumber, sortBy, sortDirection });
  }
}
