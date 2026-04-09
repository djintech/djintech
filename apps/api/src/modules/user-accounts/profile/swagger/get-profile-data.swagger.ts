import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@core/error-dto/error-response.dto';
import { UserDataViewDto } from '@modules/user-accounts/profile/api/view-dto/user-data.view-dto';

export function ApiGetProfileDataDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user profile data' }),
    ApiParam({ name: 'id', type: Number, example: 1, description: 'user ID' }),
    ApiOkResponse({
      type: UserDataViewDto,
      description: 'The response body contains the user data',
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      type: ErrorResponseDto,
    }),
  );
}
