// src/modules/posts/swagger/get-posts-by-user.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { PlansViewDto } from '../api/view-dto/plans.view-dto';

export function ApiGetPlansDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Get costs of payment-subscriptions' }),
    ApiOkResponse({
      type: PlansViewDto,
      description: 'Get plans information object',
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
  );
}
