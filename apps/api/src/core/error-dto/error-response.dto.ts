import { ApiProperty } from '@nestjs/swagger';

class FieldErrorDto {
  @ApiProperty({ example: 'Incorrect input data' })
  message: string;

  @ApiProperty({ example: 'string' })
  field: string;
}

export class ErrorResponseDto {
  @ApiProperty({ type: [FieldErrorDto] })
  errorsMessages: FieldErrorDto[];
}
