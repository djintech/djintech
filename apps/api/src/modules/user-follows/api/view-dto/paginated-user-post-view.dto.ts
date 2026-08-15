import { UserPostViewDto } from './user-post-view.dto';

export class PaginatedUserPostViewDto {
  totalCount!: number;
  pagesCount!: number;
  page!: number;
  pageSize!: number;

  prevCursor!: number;
  nextCursor!: number | null;

  items!: UserPostViewDto[];
}
