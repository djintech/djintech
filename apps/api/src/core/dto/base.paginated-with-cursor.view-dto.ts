import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, } from 'class-validator';

export class BasePaginationInputDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize: number = 12;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  cursor: number = 0;
}
