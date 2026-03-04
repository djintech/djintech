import { ApiProperty } from "@nestjs/swagger";
import { descriptionConstraints } from "../../domain/value-objects/post.value-object";
import { IsStringWithTrim } from "@src/core/decorators/validation/is-string-with-trim";

export class CreatePostInputDto {
  @ApiProperty({
      maxLength: descriptionConstraints.maxLength,
      example: 'string',
    })
    @IsStringWithTrim(0, descriptionConstraints.maxLength)
  description:	string;
}
