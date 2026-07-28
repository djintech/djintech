import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaymentsSortBy } from './payments-sort-by.enum';
import { SortDirection } from './sort-direction.enum';

@InputType()
export class GetPaymentsInput {
  @Field(() => Int, { defaultValue: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = 1;

  @Field(() => Int, { defaultValue: 6 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 6;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @Field(() => PaymentsSortBy, { defaultValue: PaymentsSortBy.CREATED_AT })
  @IsEnum(PaymentsSortBy)
  sortBy: PaymentsSortBy = PaymentsSortBy.CREATED_AT;

  @Field(() => SortDirection, { defaultValue: SortDirection.Desc })
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.Desc;
}
