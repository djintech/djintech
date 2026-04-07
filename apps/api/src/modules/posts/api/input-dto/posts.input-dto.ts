import { ApiProperty } from "@nestjs/swagger";
import { descriptionConstraints } from "../../domain/value-objects/post.value-object";
import { IsString } from "class-validator";

export class PostInputDto {
  @IsString()
  @ApiProperty({
      maxLength: descriptionConstraints.maxLength,
      example: 'description',
      nullable: true,
      description: 'post description, can be null',
    })
  description!:	string | null;
}
