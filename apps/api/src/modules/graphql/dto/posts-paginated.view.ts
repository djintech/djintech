import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PostView } from './post.view';

@ObjectType()
export class PostsPaginatedView {
  @Field(() => [PostView])
  items!: PostView[];

  @Field(() => Int)
  totalCount!: number;

  @Field(() => Int)
  pagesCount!: number;

  @Field(() => Int)
  pageSize!: number;
}
