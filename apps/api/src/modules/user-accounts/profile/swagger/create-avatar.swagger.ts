import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AvatarViewDto } from '../api/view-dto/avatar.view-dto';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiCreateAvatarDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Upload avatar image' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiConsumes('multipart/form-data'),
    ApiCreatedResponse({
      type: AvatarViewDto,
      description: 'The avatar has been successfully created.',
    }),
    ApiBadRequestResponse({
      description: 'The inputModel has incorrect values',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Profile not found', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
  