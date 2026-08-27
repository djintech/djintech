import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { BasePaginatedWithCursorViewDto } from '@src/core/dto/base-paginated-with-cursor-view.dto';
import { UserFollowViewDto } from '@src/modules/user-follows/api/view-dto/user-follow-view.dto';

export function ApiGetCommentLikesDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Get comment likes with pagination' }),

    ApiParam({ name: 'postId', type: String, description: 'id of the post', example: '123', required: true }),
    ApiParam({ name: 'commentId', type: String, description: 'id of the comment', example: '123', required: true }),

    ApiQuery({ name: 'pageSize', required: false, type: Number, example: 12, description: 'Number of likes per page',}),
    ApiQuery({ name: 'cursor', required: false, type: Number, example: 0, description: 'ID of the last like from the previous page', }),

    ApiResponse({ status: 200, type: BasePaginatedWithCursorViewDto<UserFollowViewDto[]>, description: 'Success' }),
    ApiBadRequestResponse({description: 'The inputModel has incorrect values',type: ErrorResponseDto }),
    ApiNotFoundResponse({ description: 'The post has not been found', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden. User is banned' }),

  );
}
