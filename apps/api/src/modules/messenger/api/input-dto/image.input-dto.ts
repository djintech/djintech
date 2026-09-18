import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class ImageInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  @ApiProperty({
      type: 'string',
      example: 'message',
      nullable: false,
      description: 'message content, optional',
    })
  message?:	string;
}