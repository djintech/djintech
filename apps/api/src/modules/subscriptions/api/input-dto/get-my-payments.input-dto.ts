import { BaseQueryParams } from '@src/core/dto/base.query-params.input-dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { PaymentsSortBy } from '@libs/contracts/payments/get-my-payments';

export class GetMyPaymentsQueryParams extends BaseQueryParams {
  @ApiPropertyOptional({
    type: Number,
    example: 1,
    description: 'Page number. Default is 1',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageNumber: number = 1;

  @ApiPropertyOptional({
    type: Number,
    example: 8,
    description: 'Page size. Default is 8',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize: number = 8;

  @ApiPropertyOptional({
    enum: PaymentsSortBy,
    example: PaymentsSortBy.createdAt,
    description: 'Payments sorting field',
  })
  @IsEnum(PaymentsSortBy)
  sortBy: PaymentsSortBy = PaymentsSortBy.createdAt;
}
