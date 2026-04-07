import { ApiProperty } from "@nestjs/swagger";
import { descriptionConstraints } from "../../domain/value-objects/post.value-object";
import { IsOptional, IsString } from "class-validator";

export class PostInputDto {
  @IsString()
  @ApiProperty({
      maxLength: descriptionConstraints.maxLength,
      example: 'description',
      nullable: true,
      description: 'Optional post description, can be null',
    })
  description:	string | null = null;
}
