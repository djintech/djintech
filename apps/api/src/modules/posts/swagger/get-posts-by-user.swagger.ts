// src/modules/posts/swagger/get-posts-by-user.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@src/core/decorators/swagger/api-paginated-response.decorator';
import { PostViewDto } from '../api/view-dto/posts.view-dto';

export function ApiGetPostsByUserDocs() {
  return applyDecorators(
    ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' }),
    ApiPaginatedResponse(PostViewDto),
    ApiOperation({ summary: 'Get user posts with pagination' }),
  );
}
