import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenViewDto {
  @ApiProperty({ example: "string" })
  accessToken: string 
}