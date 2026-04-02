// src/modules/posts/swagger/get-posts-by-user.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiDeletePostDocs() {
  return applyDecorators(
    ApiParam({ name: 'id', type: Number, example: 1, description: 'post ID' }),
    ApiSecurity('JwtAuth'),
    ApiNoContentResponse({ description: 'The post has been successfully deleted' }),
    ApiNotFoundResponse({ description: 'Post not found', type: ErrorResponseDto }),
    ApiForbiddenResponse({ description: 'Forbidden. The user is not the owner of the post.' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
    ApiOperation({ summary: 'Delete post by ID' }),
  );
}
