import { applyDecorators } from '@nestjs/common';
import {ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiUnauthorizedResponse, ApiNotFoundResponse,} from '@nestjs/swagger';
import { UserProfileViewDto } from '../api/view-dto/user-profile-view.dto';

export function ApiGetUserProfileDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),

    ApiOperation({
      summary: 'Get user profile by username',
      description: 'Returns user profile, follow status, followers/following/post counters.',
    }),

    ApiParam({
      name: 'userName',
      required: true,
      type: String,
      example: 'string',
      description: 'Username of the user',
    }),

    ApiResponse({ status: 200, type: UserProfileViewDto, description: 'User profile retrieved successfully' }),
    ApiNotFoundResponse({ description: 'User not found' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
