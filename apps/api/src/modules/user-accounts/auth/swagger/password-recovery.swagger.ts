import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiBadRequestResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiPasswordRecoveryDocs() {
  return applyDecorators(
    ApiNoContentResponse({ description: 'Success' }),
    ApiBadRequestResponse({ description: 'Validation errors or reCAPTCHA failure', type: ErrorResponseDto }),
    ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' }),
  );
}
