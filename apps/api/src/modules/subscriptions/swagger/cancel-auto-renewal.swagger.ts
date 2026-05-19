import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiCancelAutoRenewalDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Cancel auto renewal' }),
    ApiNoContentResponse({ description: 'Cancel auto renewal' }),
    ApiBadRequestResponse({
      description: 'Error to update subscription autorenewal',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'profile not found',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
  );
}
