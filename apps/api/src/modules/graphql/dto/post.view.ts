import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserBanView } from './user.view';

@ObjectType()
export class ImagePostView {
  @Field()
  url!: string;

  @Field(() => Int)
  position!: number;
}

@ObjectType()
export class PostOwnerView {
  @Field(() => Int)
  id!: number;

  @Field()
  userName!: string;

  @Field(() => String, { nullable: true })
  avatar!: string | null;
}

@ObjectType()
export class PostView {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  ownerId!: number;

  @Field()
  description!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => UserBanView, { nullable: true })
  userBan!: UserBanView | null;

  @Field(() => [ImagePostView])
  images!: ImagePostView[];

  @Field(() => PostOwnerView )
  postOwner!: PostOwnerView;
}
