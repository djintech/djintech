import { ApiProperty } from '@nestjs/swagger';
import { FollowsUsersResult } from '../../infrastructure/query/user-follow.query.repository';
import { UserFollowViewDto } from './user-follow-view.dto';

export class PaginatedUserFollowViewDto {
  @ApiProperty()
  totalCount!: number;

  @ApiProperty()
  pagesCount!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty({ type: Number, nullable: true })
  prevCursor!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  nextCursor!: number | null;

  @ApiProperty()
  items!: UserFollowViewDto[];

  static mapToView(
    result: FollowsUsersResult,
    buildUrl: (key: string) => string,
  ): PaginatedUserFollowViewDto {
    const dto = new PaginatedUserFollowViewDto();

    dto.totalCount = result.totalCount;
    dto.pagesCount = result.pagesCount;
    dto.pageSize = result.pageSize;

    dto.prevCursor = result.prevCursor;
    dto.nextCursor = result.nextCursor;

    dto.items = result.items.map((user) => {
      const item = new UserFollowViewDto();

      item.id = user.id;
      item.userId = user.userId;
      item.userName = user.userName;
      item.createdAt = user.createdAt;

      item.avatar = user.avatarKey
        ? buildUrl(user.avatarKey)
        : null;

      item.isFollowing = user.isFollowing;
      item.isFollowedBy = user.isFollowedBy;

      return item;
    });

    return dto;
  }
}
