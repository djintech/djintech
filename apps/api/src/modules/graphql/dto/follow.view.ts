import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class FollowView {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  userId!: number;

  @Field()
  userName!: string;

  @Field(() => String, { nullable: true })
  firstName!: string | null;

  @Field(() => String, { nullable: true })
  lastName!: string | null;

  @Field()
  createdAt!: Date; 
}
