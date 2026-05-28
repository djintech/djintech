// src/modules/posts/swagger/get-posts-by-user.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SubscriptionsViewDto } from '../api/view-dto/subscriptipns.view-dto';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiCreateSubscriptionDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Create payment-subscriptions' }),
    ApiCreatedResponse({
      type: SubscriptionsViewDto,
      description: 'The payment-subscriptions has been successfully created with status pending, need to pay',
    }),
    ApiBadRequestResponse({
      description: 'The inputModel has incorrect values',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
  );
}
