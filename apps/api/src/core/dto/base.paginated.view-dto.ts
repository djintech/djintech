import { ApiProperty } from "@nestjs/swagger";

//базовый класс view модели для запросов за списком с пагинацией
export abstract class PaginatedViewDto<T> {
  @ApiProperty({ isArray: true })
  abstract items: T;

  @ApiProperty()
  totalCount!: number;

  @ApiProperty()
  pagesCount!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  //статический метод-утилита для мапинга
  public static mapToView<T>(data: {
    items: T;
    page: number;
    size: number;
    totalCount: number;
  }): PaginatedViewDto<T> {
    return {
      totalCount: data.totalCount,
      pagesCount: Math.ceil(data.totalCount / data.size),
      page: data.page,
      pageSize: data.size,
      items: data.items,
    };
  }
}
