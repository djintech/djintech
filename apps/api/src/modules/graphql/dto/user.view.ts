import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class ProfileView {
  @Field(() => Int)
  id!: number;

  @Field(() => String, { nullable: true })
  userName!: string | null;

  @Field(() => String, { nullable: true })
  firstName!: string | null;

  @Field(() => String, { nullable: true })
  lastName!: string | null;

  @Field(() => String, { nullable: true })
  city!: string | null;

  @Field(() => String, { nullable: true })
  country!: string | null;

  @Field(() => Date, { nullable: true })
  dateOfBirth!: Date | null;

  @Field(() => String, { nullable: true })
  aboutMe!: string | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String, { nullable: true })
  avatar!: string | null;
}

@ObjectType()
export class UserBanView {
  @Field(() => String)
  reason!: string;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class UserView {
  @Field(() => Int)
  id!: number;

  @Field()
  userName!: string;

  @Field()
  email!: string;

  @Field()
  createdAt!: Date;

  @Field(() => ProfileView)
  profile!: ProfileView;

  @Field(() => UserBanView, { nullable: true })
  userBan!: UserBanView | null;
  
}
