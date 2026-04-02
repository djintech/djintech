import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiBadRequestResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiRegistrationConfirmationDocs() {
  return applyDecorators(
    ApiNoContentResponse({ description: 'Email verified, account activated' }),
    ApiBadRequestResponse({ description: 'Incorrect input data', type: ErrorResponseDto }),
    ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' }),
  );
}
