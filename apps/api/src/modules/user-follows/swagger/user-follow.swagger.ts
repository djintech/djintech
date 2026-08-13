import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiUnauthorizedResponse, } from '@nestjs/swagger';

export function ApiUserFollowDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({
      summary: 'Follow a user',
      description: 'Follows a user by their ID.',
    }),

    ApiResponse({ status: 201, description: 'User followed successfully' }),
    ApiNotFoundResponse({ description: 'User not found', }),
    ApiBadRequestResponse({ description: 'Bad Request', }),
    ApiUnauthorizedResponse({ description: 'Unauthorized', }),
  );
}
