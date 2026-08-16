import { Field, Int, ObjectType } from '@nestjs/graphql';
import { FollowView } from './follow.view';

@ObjectType()
export class FollowersPaginatedView {
  @Field(() => [FollowView])
  items!: FollowView[];

  @Field(() => Int)
  totalCount!: number;

  @Field(() => Int)
  pagesCount!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;
}
