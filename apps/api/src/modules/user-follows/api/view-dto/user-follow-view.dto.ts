import { ApiProperty } from "@nestjs/swagger";
import { FollowUser } from "../../infrastructure/query/user-follow.query.repository";

export class UserFollowViewDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  userId!: number;

  @ApiProperty()
  userName!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: String, nullable: true })
  avatar!: string | null;

  @ApiProperty()
  isFollowing!: boolean;

  @ApiProperty()
  isFollowedBy!: boolean;

  static mapToView(
    result: FollowUser,
    buildUrl: (key: string) => string,
  ): UserFollowViewDto {
    const dto = new UserFollowViewDto();

    dto.id = result.id;
    dto.userId = result.userId;
    dto.userName = result.userName;
    dto.createdAt = result.createdAt;

    dto.avatar = result.avatarKey
        ? buildUrl(result.avatarKey)
        : null;

    dto.isFollowing = result.isFollowing;
    dto.isFollowedBy = result.isFollowedBy;

    return dto;
  }
}
