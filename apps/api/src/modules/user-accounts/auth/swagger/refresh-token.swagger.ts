import { applyDecorators } from '@nestjs/common';
import { ApiSecurity, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RefreshTokenViewDto } from '../api/view-dto/refresh-token.view-dto';

export function ApiRefreshTokenDocs() {
  return applyDecorators(
    ApiSecurity('refreshToken'),
    ApiOkResponse({ type: RefreshTokenViewDto, description: 'Returns JWT accessToken in body and refreshToken in cookie' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
