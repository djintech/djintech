// src/modules/posts/swagger/get-posts-by-user.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PostViewDto } from '../api/view-dto/posts.view-dto';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiGetPostByIdDocs() {
  return applyDecorators(
    ApiParam({ name: 'id', type: Number, example: 1, description: 'post ID' }),
    ApiOkResponse({ type: PostViewDto, description: 'The response body contains the post data' }),
    ApiNotFoundResponse({ description: 'Post not found', type: ErrorResponseDto }),
    ApiOperation({ summary: 'Get post by id' })
  );
}
