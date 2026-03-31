import { ApiProperty } from '@nestjs/swagger';

export class PayloadTooLargeErrorDto {
  @ApiProperty({ example: 'File too large' })
  message: string;

  @ApiProperty({ example: 'Payload Too Large' })
  error: string;

  @ApiProperty({ example: 413 })
  statusCode: number;
}
