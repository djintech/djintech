import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

//базовый класс для query параметров с пагинацией
//значения по-умолчанию применятся автоматически при настройке глобального ValidationPipe в main.ts
export class BaseQueryParams {
  //для трансформации в number
   @ApiPropertyOptional({
    type: Number,
    example: 1,
    description: 'Page number. Default is 1',
  })
  @IsNumber()
  @Type(() => Number)
  @IsNumber()
  pageNumber: number = 1;

  @ApiPropertyOptional({
    type: Number,
    example: 8,
    description: 'Page size',
  })
  @Type(() => Number)
  @IsNumber()
  pageSize: number = 8;

  @ApiPropertyOptional({
    enum: SortDirection,
    example: SortDirection.Desc,
    description: 'Sort direction',
  })
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.Desc;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
