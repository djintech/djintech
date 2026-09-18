import { applyDecorators } from '@nestjs/common';
import { ApiAcceptedResponse, ApiBody, ApiForbiddenResponse, ApiOperation, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UpdateMessageStatusDto } from '../api/input-dto/update-message-statuses.input-dto';

export function ApiUpdateMessageStatusDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiBody({ type: UpdateMessageStatusDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
    ApiForbiddenResponse({ description: 'Forbidden. User is banned.' }),
    ApiAcceptedResponse( { description: 'Message status updated' }),
    ApiOperation({ summary: 'Update message status' }),
  );
}
