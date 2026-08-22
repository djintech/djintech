import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiSecurity, ApiForbiddenResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { CreatePostWithFilesDto } from '../api/input-dto/posts-with-files.input-dto';
import { PostViewDto } from '../api/view-dto/posts.view-dto';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { CommentInputDto } from '../api/input-dto/comment.input-dto';
import { CommentViewDto } from '../api/view-dto/comment.view-dto';

export function ApiCreateCommentDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiBody({ type: CommentInputDto }),
    ApiCreatedResponse({
      type: CommentViewDto,
      description: 'The comment has been successfully created. The response body contains the comment data',
    }),
    ApiBadRequestResponse({
      description: 'The inputModel has incorrect values',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({ description: 'The post has not been found', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden. User is banned' }),
  );
}
  