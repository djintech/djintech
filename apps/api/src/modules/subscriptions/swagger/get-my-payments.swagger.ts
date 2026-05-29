import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaymentsWithPaginationViewModel } from '../api/view-dto/payments.view-dto';

export function ApiGetMyPaymentsDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Get current user subscription payments history' }),
    ApiOkResponse({
      type: PaymentsWithPaginationViewModel,
      description: 'Paginated subscription payments history',
    }),
    ApiBadRequestResponse({ description: 'Invalid query params' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
