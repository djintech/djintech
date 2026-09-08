import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiUnauthorizedResponse, } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { GetDialogueViewDto } from '../api/view-dto/get-dialogue.view-dto';

export function ApiGetDialogueByIdDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),

    ApiOperation({ summary: 'Get dialogue messages', description: 'Returns messages from a dialogue with the specified user. Supports cursor pagination.' }),

    ApiParam({ name: 'dialoguePartnerId', type: Number, example: 123, required: true, description: 'ID of the dialogue partner.'  }),

    ApiQuery({ name: 'cursor', required: false, type: Number, example: 0, description: 'ID of the last message from the previous page. If not provided, the first page is returned.' }),
    ApiQuery({ name: 'pageSize', required: false, type: Number, example: 12, description: 'Number of messages to return.' }),

    ApiResponse({ status: 200, type: GetDialogueViewDto, description: 'Success' }),
    ApiBadRequestResponse({ description: 'The input model has incorrect values.', type: ErrorResponseDto}),
    ApiNotFoundResponse({ description: 'Dialogue partner has not been found.', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden. User is banned.' }),
  );
}