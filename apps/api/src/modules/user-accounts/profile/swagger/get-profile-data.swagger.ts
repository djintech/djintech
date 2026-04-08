import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@core/error-dto/error-response.dto';

export function ApiGetProfileDataDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user profile data' }),
    ApiParam({ name: 'id', type: Number, example: 1, description: 'user ID' }),
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          aboutMe: { type: 'string', nullable: true },
          avatar: { type: 'string', nullable: true },
          postsCount: { type: 'number' },
          followersCount: { type: 'number' },
          followingCount: { type: 'number' },
        },
      },
      description: 'The response body contains the user data',
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      type: ErrorResponseDto,
    }),
  );
}
