// src/modules/posts/swagger/get-posts-by-user.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { PostInputUpdateDto } from '../api/input-dto/posts.input-dto';

export function ApiUpdatePostDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Update post' }),
    ApiBody({ type: PostInputUpdateDto }),
    ApiNoContentResponse({ description: 'The post has been successfully updated' }),
    ApiNotFoundResponse({ description: 'Post not found', type: ErrorResponseDto }),
    ApiBadRequestResponse({ description: 'The inputModel has incorrect values', type: ErrorResponseDto }),
    ApiForbiddenResponse({ description: 'Forbidden. The user is not the owner of the post.' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
  );
}
