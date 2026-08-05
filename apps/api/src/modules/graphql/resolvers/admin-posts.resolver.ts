import { UseFilters, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { DomainGraphqlExceptionsFilter } from '@libs/core/exceptions/filters/domain-graphql-exceptions.filter';
import { GqlAuthGuard } from '../guards/gql-super-admin.guard';
import { GetPostsInput } from '../dto/get-posts.input';
import { GetPostsQuery } from '../application/queries/get-posts.query';
import { PostsPaginatedView } from '../dto/posts-paginated.view';
import { PostView } from '../dto/post.view';
import { pubSub } from '../pubsub/pubsub';

@Resolver()
@SkipThrottle()
@UseFilters(DomainGraphqlExceptionsFilter)
export class AdminPostsResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => PostsPaginatedView, { name: 'getPosts' })
  @UseGuards(GqlAuthGuard)
  async getPosts(
    @Args('input', { type: () => GetPostsInput }) input: GetPostsInput,
  ): Promise<PostsPaginatedView> {
    return this.queryBus.execute(new GetPostsQuery(input));
  }

  @Subscription(() => PostView, {
    name: 'postAdded',
  })
  postAdded() {
    return pubSub.asyncIterableIterator('postAdded');
  }
}
