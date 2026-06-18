import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiDeleteNotificationDocs() {
  return applyDecorators(
    ApiParam({ name: 'id', type: Number, example: 1, description: 'notification ID' }),
    ApiSecurity('JwtAuth'),
    ApiNotFoundResponse({ description: 'Notification not found', type: ErrorResponseDto }),
    ApiForbiddenResponse({ description: 'Forbidden. The user is not the owner of the notification.' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
    ApiOperation({ summary: 'Delete notification by ID' }),
  );
}
