import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query.repository';
import { FileUrlService } from '@src/core/file/file-url.service';
import { BasePaginationInputDto } from '@src/core/dto/base.paginated-with-cursor.view-dto';
import { BasePaginatedWithCursorViewDto } from '@src/core/dto/base-paginated-with-cursor-view.dto';
import { FeedViewDto } from '../../api/view-dto/feed.view-dto';

export class GetFeedQuery {
  constructor(
    public userId: number,
    public query: BasePaginationInputDto,
  ) {}
}

@QueryHandler(GetFeedQuery)
export class GetFeedQueryHandler
  implements IQueryHandler< GetFeedQuery, BasePaginatedWithCursorViewDto<FeedViewDto[]>>
{
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async execute({ userId, query }: GetFeedQuery) {
    const { posts, nextCursor } = await this.postsQueryRepository.getFeed({
      userId,
      cursor: query.cursor,
      pageSize: query.pageSize,
    });

    const buildUrl = this.fileUrlService.getPublicUrl.bind( this.fileUrlService );

    const items = posts.map((post) =>
      FeedViewDto.mapToView(
        post,
        buildUrl,
        userId,
      ),
    );

    return BasePaginatedWithCursorViewDto.mapToView({
      items,
      prevCursor: query.cursor,
      nextCursor,
      pageSize: query.pageSize,
    });
  }
}
