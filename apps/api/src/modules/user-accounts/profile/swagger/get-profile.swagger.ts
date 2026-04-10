import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { ProfileViewDto } from '../api/view-dto/profile.view-dto';


export function ApiGetProfileDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user profile data' }),
    ApiParam({ name: 'id', type: Number, example: 1, description: 'user ID' }),
    ApiOkResponse({
      type: ProfileViewDto,
      description: 'Get profile information object',
    }),
    ApiNotFoundResponse({ description: 'Profile not found', type: ErrorResponseDto }),
  );
}
  