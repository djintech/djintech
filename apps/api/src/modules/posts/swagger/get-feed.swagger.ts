import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery, ApiUnauthorizedResponse, ApiSecurity, ApiForbiddenResponse, } from '@nestjs/swagger';
import { BasePaginatedWithCursorViewDto } from '@src/core/dto/base-paginated-with-cursor-view.dto';
import { FeedViewDto } from '../api/view-dto/feed.view-dto';

export function ApiGetFeedDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({
      summary: 'Get posts feed',
      description:
        'Returns posts published by users followed by the current user.',
    }),

    ApiQuery({ name: 'pageSize', required: false, type: Number, example: 12 }),
    ApiQuery({ name: 'cursor', required: false, type: Number, example: 0 }),

    ApiOkResponse({ description: 'Posts feed', type: BasePaginatedWithCursorViewDto<FeedViewDto[]> }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden. User is banned' }),
  );
}
