import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';
import { SortDirection } from './sort-direction.enum';
import { FollowersSortBy } from './followers-sort-by.enum';

@InputType()
export class GetFollowUsersInput {
  @Field(() => Int, { defaultValue: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 10;

  @Field(() => FollowersSortBy, { defaultValue: FollowersSortBy.CREATED_AT })
  @IsEnum(FollowersSortBy)
  sortBy: FollowersSortBy = FollowersSortBy.CREATED_AT;

  @Field(() => SortDirection, { defaultValue: SortDirection.Desc })
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.Desc;

  @Field(() => Int)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId!: number;
}
