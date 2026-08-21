import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { contentConstraints } from "../../domain/value-objects/comment.value-object";
import { Transform } from "class-transformer";

export class CommentInputDto {
  @ApiProperty({
    type: 'string',
    minLength: contentConstraints.minLength,
    maxLength: contentConstraints.maxLength,
    example: 'This is my comment',
    nullable: false,
    description: 'Content of the comment',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(contentConstraints.maxLength)
  content!: string;
}
