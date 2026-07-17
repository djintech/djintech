import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class UserView {
  @Field(() => Int)
  id!: number;

  @Field()
  username!: string;

  @Field()
  email!: string;

  @Field()
  createdAt!: Date;

  @Field()
  isBanned!: boolean;

  @Field(() => Int, { nullable: true })
  profileId?: number | null;
}
