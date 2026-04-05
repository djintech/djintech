import { ApiProperty } from "@nestjs/swagger";
import { Avatar } from "@src/generated/prisma/client";

export class AvatarViewDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  createdAt!: Date;

  static mapToView( avatar: Avatar, buildUrl: (key: string) => string ): AvatarViewDto {
    const dto = new AvatarViewDto();

    dto.id = avatar.id;
    dto.url = `${buildUrl(avatar.key)}?v=${avatar.createdAt.getTime()}`; 
    dto.createdAt = avatar.createdAt;
    
    return dto;
  }
}
