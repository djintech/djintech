import { applyDecorators } from '@nestjs/common';
import { ApiSecurity, ApiNoContentResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiLogoutDocs() {
  return applyDecorators(
    ApiSecurity('refreshToken'),
    ApiSecurity('JwtAuth'),
    ApiNoContentResponse({ description: 'Success' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized: JWT accessToken is missing, expired or incorrect' }),
  );
}
  