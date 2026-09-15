import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiDeleteMessageDocs() {
  return applyDecorators(
    ApiParam({ name: 'id', type: Number, example: 1, description: 'message ID' }),
    ApiSecurity('JwtAuth'),
    ApiNotFoundResponse({ description: 'Message not found', type: ErrorResponseDto }),
    ApiForbiddenResponse({ description: 'Forbidden. The user is not the owner of the message.' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
    ApiOperation({ summary: 'Delete message by ID' }),
  );
}
