// src/modules/user-accounts/swagger/auth/get-me.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { MeViewDto } from '../api/view-dto/me.view-dto';

export function ApiGetMeDocs() {
  return applyDecorators(
    ApiBearerAuth('JwtAuth'),
    ApiOkResponse({ type: MeViewDto, description: 'Success' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized: JWT accessToken is missing, expired or incorrect' }),
  );
}
