import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiUnauthorizedResponse, } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { GetMessagesViewDto } from '../api/view-dto/get-messages.view-dto';

export function ApiGetMessagesDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),

    ApiOperation({
      summary: 'Get messenger chats',
      description: 'Returns a paginated list of user dialogues with the latest message in each dialogue. Supports username search and cursor pagination.',
    }),

    ApiQuery({ name: 'cursor', required: false, type: Number, example: 0, description: 'ID of the last message from the previous page. If not provided, the first page is returned.' }),
    ApiQuery({ name: 'pageSize', required: false, type: Number, example: 12, description: 'Number of chats to return.' }),
    ApiQuery({ name: 'searchName', required: false, type: String, example: 'alex', description: 'Search dialogues by partner username.' }),

    ApiResponse({ status: 200, type: GetMessagesViewDto, description: 'Success' }),
    ApiBadRequestResponse({ description: 'The input model has incorrect values.', type: ErrorResponseDto}),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden. User is banned.' }),
  );
}
