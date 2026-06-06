import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentPaymentSubscriptionViewDto } from '../api/view-dto/current-payment-subscription.view-dto';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiGetCurrentPaymentSubscriptionDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Get current payment subscription for user' }),
    ApiOkResponse({ type: CurrentPaymentSubscriptionViewDto, description: 'Current payment subscription. Returns null if no active subscription exists.', }),
    ApiBadRequestResponse({ description: 'The inputModel has incorrect values', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
