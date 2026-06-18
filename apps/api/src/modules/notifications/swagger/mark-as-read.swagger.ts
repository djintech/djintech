import { applyDecorators } from '@nestjs/common';
import { ApiAcceptedResponse, ApiBody, ApiOperation, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { MarkAsReadInputDto } from '../api/input-dto/mark-as-read.input-dto';

export function ApiMarkAsReadDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiBody({ type: MarkAsReadInputDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
    ApiAcceptedResponse( { description: 'Notifications marked as read' }),
    ApiOperation({ summary: 'Mark notifications as read' }),
  );
}
