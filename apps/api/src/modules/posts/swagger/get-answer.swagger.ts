import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { PaginatedViewDto } from '@src/core/dto/base.paginated.view-dto';
import { SortDirection } from '@src/core/dto/base.query-params.input-dto';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { AnswerViewDto } from '../api/view-dto/answer.view-dto';

export function ApiGetAnswersDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Get answers with pagination' }),

    ApiParam({ name: 'postId', type: String, description: 'id of the post', example: '123', required: true }),
    ApiParam({ name: 'commentId', type: String, description: 'id of the comment', example: '123', required: true }),

    ApiQuery({ name: 'pageSize', required: false, type: Number, example: 12, description: 'Number of users per page',}),
    ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1, description: 'Page number', }),
    ApiQuery({ name: 'sortDirection', required: false, type: String, example: SortDirection.Desc, description: 'Sort by desc or asc. Available values : asc, desc. Default value : desc', }),

    ApiResponse({ status: 200, description: 'Success', type: PaginatedViewDto<AnswerViewDto[]> }),
    ApiBadRequestResponse({description: 'The inputModel has incorrect values',type: ErrorResponseDto }),
    ApiNotFoundResponse({ description: 'The post has not been found', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden. User is banned' }),

  );
}
