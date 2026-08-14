import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiUnauthorizedResponse, } from '@nestjs/swagger';

export function ApiUserUnfollowDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({
      summary: 'Unfollow a user',
      description: 'Unfollows a user by their ID.',
    }),
    ApiParam({
      name: 'userId',
      required: true,
      type: Number,
      example: 123,
      description: 'ID of the user to unfollow',
    }),
    ApiResponse({ status: 204, description: 'User unfollowed successfully' }),
    ApiBadRequestResponse({ description: 'Bad Request', }),
    ApiUnauthorizedResponse({ description: 'Unauthorized', }),
  );
}
