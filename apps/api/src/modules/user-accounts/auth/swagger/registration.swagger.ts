import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiBadRequestResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiRegistrationDocs() {
  return applyDecorators(
    ApiNoContentResponse({ description: 'Email with verification code sent' }),
    ApiBadRequestResponse({ description: 'Validation errors or user already exists', type: ErrorResponseDto }),
    ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' }),
  );
}
