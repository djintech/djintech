import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UseFilters, UseGuards } from '@nestjs/common';
import { GetUsersQuery } from '../application/queries/get-users.query';
import { GetUserQuery } from '../application/queries/get-user.query';
import { BanUserCommand } from '../application/commands/ban-user.command';
import { UsersPaginatedView } from '../dto/users-paginated.view';
import { UserView } from '../dto/user.view';
import { GetUsersInput } from '../dto/get-users.input';
import { GqlAuthGuard } from '../guards/gql-super-admin.guard';
import { DomainGraphqlExceptionsFilter } from '@libs/core/exceptions/filters/domain-graphql-exceptions.filter';
import { SkipThrottle } from '@nestjs/throttler';
import { BanUserInput } from '../dto/ban-user.input';

@Resolver()
@SkipThrottle()
@UseFilters(DomainGraphqlExceptionsFilter)
export class AdminUsersResolver {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Query(() => UsersPaginatedView, { name: 'getUsers' })
  @UseGuards(GqlAuthGuard)
  async getUsers(
    @Args('input', { type: () => GetUsersInput, nullable: true })
    input: GetUsersInput = new GetUsersInput(),
  ): Promise<UsersPaginatedView> {
    return this.queryBus.execute(new GetUsersQuery(input));
  }

  
  @Query(() => UserView, { name: 'getUser' })
  @UseGuards(GqlAuthGuard)
  async getUser(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<UserView> {
    return this.queryBus.execute(new GetUserQuery(userId));
  }

  @Mutation(() => Boolean, { name: 'banUser' })
  @UseGuards(GqlAuthGuard)
  async banUser(
    @Args('input') input: BanUserInput,
  ): Promise<boolean> {
    return this.commandBus.execute(
      new BanUserCommand(input.userId, input.banReason),
    );
  }
}
