import { ApiProperty } from '@nestjs/swagger';

export class LoginViewDto {
  @ApiProperty({ example: "string" })
  accessToken: string 
}