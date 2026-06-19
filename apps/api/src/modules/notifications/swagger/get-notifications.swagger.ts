import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { NotificationsListViewDto } from '../api/view-dto/notifications-list.view-dto';

export function ApiGetNotificationDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOkResponse({ type: NotificationsListViewDto, description: 'The response body contains the notifications data' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
    ApiOperation({ summary: 'Get notifications' }),
  );
}
