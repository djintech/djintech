import { Args, Query, Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseFilters, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-super-admin.guard';
import { DomainGraphqlExceptionsFilter } from '@libs/core/exceptions/filters/domain-graphql-exceptions.filter';
import { SkipThrottle } from '@nestjs/throttler';
import { GetFollowersQuery } from '../application/queries/get-followers.query';
import { GetFollowUsersInput } from '../dto/get-follow.input';
import { FollowersPaginatedView } from '../dto/followers-paginated.view';
import { GetFollowingQuery } from '../application/queries/get-following.query';

@Resolver()
@SkipThrottle()
@UseFilters(DomainGraphqlExceptionsFilter)
export class AdminFollowersResolver {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => FollowersPaginatedView, { name: 'getFollowers' })
  @UseGuards(GqlAuthGuard)
  async getFollowers(
    @Args('input', { type: () => GetFollowUsersInput, nullable: true })
    input: GetFollowUsersInput = new GetFollowUsersInput(),
  ): Promise<FollowersPaginatedView> {
    return this.queryBus.execute(new GetFollowersQuery(input));
  }

  @Query(() => FollowersPaginatedView, { name: 'getFollowing' })
  @UseGuards(GqlAuthGuard)
  async getFollowing(
    @Args('input', { type: () => GetFollowUsersInput, nullable: true })
    input: GetFollowUsersInput = new GetFollowUsersInput(),
  ): Promise<FollowersPaginatedView> {
    return this.queryBus.execute(new GetFollowingQuery(input));
  }
}
