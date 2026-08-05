import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SortDirection } from './sort-direction.enum';
import { PostsSortBy } from './posts-sort-by.enum';

@InputType()
export class GetPostsInput {
  @Field(() => Int, { nullable: true })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  endCursorPostId?: number;

  @Field(() => Int, { defaultValue: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 10;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @Field(() => PostsSortBy, { defaultValue: PostsSortBy.CREATED_AT })
  @IsEnum(PostsSortBy)
  sortBy: PostsSortBy = PostsSortBy.CREATED_AT;

  @Field(() => SortDirection, { defaultValue: SortDirection.Desc })
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.Desc;
}
