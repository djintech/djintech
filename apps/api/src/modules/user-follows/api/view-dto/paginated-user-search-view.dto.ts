import { ApiProperty } from '@nestjs/swagger';

import { SearchUsersResult } from '../../infrastructure/query/users.query-repository';

export class UserSearchItemDto {
  @ApiProperty({
    example: 123,
  })
  id!: number;

  @ApiProperty({
    example: 'ivan_petrov',
  })
  username!: string;

  @ApiProperty({
    nullable: true,
    example: 'Иван',
  })
  firstName!: string | null;

  @ApiProperty({
    nullable: true,
    example: 'Петров',
  })
  lastName!: string | null;

  @ApiProperty({
    nullable: true,
    example: 'https://example.com/avatar.jpg',
  })
  avatarUrl!: string | null;

  @ApiProperty({
    example: '2026-08-11T20:59:58.202Z',
  })
  createdAt!: Date;
}

export class PaginatedUserSearchViewDto {
  @ApiProperty({
    example: 0,
  })
  prevCursor!: number;

  @ApiProperty({
    example: 37,
    nullable: true,
  })
  nextCursor!: number | null;

  @ApiProperty({
    example: 12,
  })
  pageSize!: number;

  @ApiProperty({
    type: [UserSearchItemDto],
  })
  items!: UserSearchItemDto[];

  static mapToView(
    result: SearchUsersResult,
    prevCursor: number,
    pageSize: number,
    buildUrl: (key: string) => string,
  ): PaginatedUserSearchViewDto {
    const dto = new this();

    dto.prevCursor = prevCursor;
    dto.nextCursor = result.nextCursor;
    dto.pageSize = pageSize;

    dto.items = result.items.map((user) => {
      const item = new UserSearchItemDto();

      item.id = user.id;
      item.username = user.username;
      item.firstName = user.profile?.firstName ?? null;
      item.lastName = user.profile?.lastName ?? null;
      item.avatarUrl = user.profile?.avatar?.key
        ? buildUrl(user.profile.avatar.key)
        : null;
      item.createdAt = user.createdAt;

      return item;
    });

    return dto;
  }
}
