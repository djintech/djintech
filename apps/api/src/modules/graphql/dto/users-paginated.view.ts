import { Field, ObjectType, Int } from '@nestjs/graphql';
import { UserView } from './user.view';

@ObjectType()
export class UsersPaginatedView {
  @Field(() => [UserView])
  items!: UserView[];

  @Field(() => Int)
  totalCount!: number;

  @Field(() => Int)
  pagesCount!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;
}
