import { ApiProperty } from '@nestjs/swagger';

export abstract class BasePaginatedWithCursorViewDto<T> {
  @ApiProperty({ isArray: true })
  abstract items: T;

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

//статический метод-утилита для мапинга
  public static mapToView<T>(data: {
    items: T;
    prevCursor: number;
    nextCursor: number | null;
    pageSize: number;
  }): BasePaginatedWithCursorViewDto<T> {
    return {
      prevCursor: data.prevCursor,
      nextCursor: data.nextCursor,
      pageSize: data.pageSize,
      items: data.items,
    };
  }
}
