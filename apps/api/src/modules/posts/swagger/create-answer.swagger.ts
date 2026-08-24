import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiSecurity, ApiForbiddenResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { CommentInputDto } from '../api/input-dto/comment.input-dto';
import { AnswerViewDto } from '../api/view-dto/answer.view-dto';

export function ApiCreateAnswerDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiBody({ type: CommentInputDto }),
    ApiCreatedResponse({
      type: AnswerViewDto,
      description: 'The answer has been successfully created. The response body contains the comment data',
    }),
    ApiBadRequestResponse({
      description: 'The inputModel has incorrect values',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({ description: 'The comment has not been found', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden. User is banned' }),
  );
}
  