import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiBadRequestResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiRegistrationEmailResendingDocs() {
  return applyDecorators(
    ApiNoContentResponse({ description: 'Verification email sent again' }),
    ApiBadRequestResponse({ description: 'Incorrect input data', type: ErrorResponseDto }),
    ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' }),
  );
}
