import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiUnauthorizedResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function ApiGetUserFollowersDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),

    ApiOperation({
      summary: 'Get followers by username',
      description: 'Returns a paginated list of users who follow the specified user.', }),

    ApiParam({ name: 'userName', required: true, type: String, example: 'string', description: 'Username of the user', }),

    ApiQuery({ name: 'search', required: false, type: String, example: 'alex', description: 'Search followers by username', }),
    ApiQuery({ name: 'pageSize', required: false, type: Number, example: 12, description: 'Number of users per page',}),
    ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1, description: 'Page number', }),
    ApiQuery({ name: 'cursor', required: false, type: Number, example: 0, description: 'Cursor for loading the next page', }),

    ApiResponse({ status: 200, description: 'Followers retrieved successfully', }),
    ApiBadRequestResponse({ description: 'The inputModel has incorrect values', }),
    ApiNotFoundResponse({description: 'User not found',}),
    ApiUnauthorizedResponse({ description: 'Unauthorized', }),
  );
}
