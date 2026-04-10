import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { ProfileInputDto } from '../api/input-dto/profile.input-dto';


export function ApiUpdateProfileDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Update user profile data' }),
    ApiBody({ type: ProfileInputDto }),
    ApiNoContentResponse({ description: 'Update profile successfully' }),
    ApiNotFoundResponse({ description: 'User not found', type: ErrorResponseDto }),
    ApiBadRequestResponse({ description: 'The inputModel has incorrect values', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
  );
}
  