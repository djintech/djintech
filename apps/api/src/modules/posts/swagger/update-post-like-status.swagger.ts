// src/modules/posts/swagger/get-posts-by-user.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { UpdatePostLikeStatusInputDto } from '../api/input-dto/update-post-like-status.input-dto';

export function ApiUpdatePostLikeStatusDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Update post like status' }),
    
    ApiBody({ type: UpdatePostLikeStatusInputDto }),
    ApiParam({ name: 'id', type: String, description: 'id of the post', example: '123', required: true }),
    
    ApiNoContentResponse({ description: 'The post like status has been successfully updated' }),
    ApiNotFoundResponse({ description: 'Post not found', type: ErrorResponseDto }),
    ApiBadRequestResponse({ description: 'The inputModel has incorrect values', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
    ApiForbiddenResponse({ description: 'Forbidden. User is banned' }),
  );
}
