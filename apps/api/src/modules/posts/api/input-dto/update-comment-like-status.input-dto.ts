import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { LikeCommentStatus } from "@src/generated/prisma/enums";

export class UpdateCommentLikeStatusInputDto {
  @ApiProperty({
    type: 'string',
    enum: LikeCommentStatus,
    default: LikeCommentStatus.NONE,
    example: 'NONE',
    nullable: false,
    description: 'default: NONE Send NONE if you want to unlike or none',
  })
  @IsEnum(LikeCommentStatus)
  @IsNotEmpty()
  likeStatus: LikeCommentStatus = LikeCommentStatus.NONE;
}
