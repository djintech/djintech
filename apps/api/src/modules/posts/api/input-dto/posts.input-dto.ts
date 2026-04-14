import { ApiProperty } from "@nestjs/swagger";
import { descriptionConstraints } from "../../domain/value-objects/post.value-object";
import { IsOptional, IsString } from "class-validator";

export class PostInputDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
      type: 'string',
      maxLength: descriptionConstraints.maxLength,
      example: 'description',
      nullable: false,
      description: 'post description, optional',
    })
  description?:	string;
}

export class PostInputUpdateDto {
  @IsOptional()
  @ApiProperty({
      type: 'string',
      maxLength: descriptionConstraints.maxLength,
      example: 'description',
      nullable: true,
      description: 'post description, optional, can be null',
    })
  description!:	string | null;
}
