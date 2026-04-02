import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { LoginInputDto } from '../api/input-dto/login-input.dto';
import { LoginViewDto } from '../api/view-dto/login.view-dto';

export function ApiLoginDocs() {
  return applyDecorators(
    ApiBody({ type: LoginInputDto }),
    ApiOkResponse({ type: LoginViewDto, description: 'Success' }),
    ApiBadRequestResponse({ description: 'Invalid credentials or email not confirmed', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' }),
  );
}
