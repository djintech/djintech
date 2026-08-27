import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { LikePostStatus } from "@src/generated/prisma/enums";

export class UpdatePostLikeStatusInputDto {
  @ApiProperty({
    type: 'string',
    enum: LikePostStatus,
    default: LikePostStatus.NONE,
    example: 'NONE',
    nullable: false,
    description: 'default: NONE Send NONE if you want to unlike or none',
  })
  @IsEnum(LikePostStatus)
  @IsNotEmpty()
  likeStatus: LikePostStatus = LikePostStatus.NONE;
}
