import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiBadRequestResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';

export function ApiNewPasswordDocs() {
  return applyDecorators(
    ApiNoContentResponse({ description: 'Success' }),
    ApiBadRequestResponse({ description: 'Invalid new password or recovery code', type: ErrorResponseDto }),
    ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' }),
  );
}
