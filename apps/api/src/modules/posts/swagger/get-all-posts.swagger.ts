// src/modules/posts/swagger/get-posts-by-user.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@src/core/decorators/swagger/api-paginated-response.decorator';
import { PostViewDto } from '../api/view-dto/posts.view-dto';

export function ApiGetAllPostsDocs() {
  return applyDecorators(
    ApiPaginatedResponse(PostViewDto),
    ApiOperation({ summary: 'Get all posts with pagination' }),
  );
}
