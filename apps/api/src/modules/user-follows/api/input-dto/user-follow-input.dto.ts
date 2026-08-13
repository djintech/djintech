import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";

export class UserFollowInputDto {
  @ApiProperty({
    description: 'ID пользователя, на которого нужно подписаться',
    example: 123,
  })
  @IsInt()
  @IsNotEmpty()
  selectedUserId!: number;
}
