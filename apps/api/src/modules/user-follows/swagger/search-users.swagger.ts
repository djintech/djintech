import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth,  ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiUnauthorizedResponse, } from '@nestjs/swagger';
import { PaginatedUserSearchViewDto } from '../api/view-dto/paginated-user-search-view.dto';

export function ApiSearchUsersDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({
      summary: 'Search users by username',
      description: 'Searches users by full or partial username with cursor-based pagination.',
    }),
    ApiQuery({
      name: 'username',
      required: true,
      type: String,
      example: 'ivan',
      description: 'Full or partial username',
    }),
    ApiQuery({
      name: 'cursor',
      required: false,
      type: Number,
      description: 'ID of the last user from the previous page',
    }),
    ApiResponse({ status: 200, type: PaginatedUserSearchViewDto, }),
    ApiUnauthorizedResponse({ description: 'Unauthorized', }),
  );
}
