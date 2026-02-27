import { ApiProperty } from "@nestjs/swagger";
import { User } from "@src/generated/prisma/client";

export class MeViewDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  static mapToView(user: User): MeViewDto {
    const dto = new MeViewDto();

    dto.email = user.email;
    dto.username = user.username;
    dto.userId = user.id!.toString();

    return dto;
  }
}
