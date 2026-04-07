import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiDeleteAvatarDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Delete avatar image by user' }),
    ApiNoContentResponse({ description: 'The avatar has been successfully deleted' }),
    ApiNotFoundResponse({ description: 'Avatar not found', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
  