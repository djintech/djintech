import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { UserStatusFilter } from './user-status-filter.enum';
import { UserSortBy } from './user-sort-by.enum';
import { Type } from 'class-transformer';
import { SortDirection } from './sort-direction.enum';

@InputType()
export class GetUsersInput {
  @Field(() => Int, { defaultValue: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = 1;

  @Field(() => Int, { defaultValue: 8 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 8;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @Field(() => UserSortBy, { defaultValue: UserSortBy.CREATED_AT })
  @IsEnum(UserSortBy)
  sortBy: UserSortBy = UserSortBy.CREATED_AT;

  @Field(() => SortDirection, { defaultValue: SortDirection.Desc })
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.Desc;

  @Field(() => UserStatusFilter, { defaultValue: UserStatusFilter.ALL })
  @IsEnum(UserStatusFilter)
  statusFilter: UserStatusFilter = UserStatusFilter.ALL;

  calculateSkip(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
