import { applyDecorators } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiCreatedResponse, ApiForbiddenResponse, ApiOperation, ApiParam, ApiSecurity, ApiTooManyRequestsResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { MessageViewDto } from "../api/view-dto/message.view-dto";
import { ErrorResponseDto } from "@src/core/error-dto/error-response.dto";

export function ApiCreateVoiceDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiParam({ name: 'receiverId', type: Number, example: 1, description: 'receiver ID' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        description: 'AAC, M4A, MP3, OGG, WAV, or WebM audio, maximum size 3 MB and duration 60 seconds',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          }
        },
        required: ['file'],
      },
    }),
    ApiCreatedResponse({ type: MessageViewDto, description: 'The voice message has been successfully created. The response body contains the message data' }),
    ApiBadRequestResponse({ description: 'The inputModel has incorrect values', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
    ApiForbiddenResponse({ description: 'Forbidden. User is banned.' }),
    ApiTooManyRequestsResponse({ description: 'More than 5 attempts from one IP-address during 10 seconds.' }),
    ApiOperation({ summary: 'Create voice message' }),
  );
}
