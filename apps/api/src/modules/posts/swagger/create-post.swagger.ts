import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiSecurity, ApiForbiddenResponse } from '@nestjs/swagger';
import { CreatePostWithFilesDto } from '../api/input-dto/posts-with-files.input-dto';
import { PostViewDto } from '../api/view-dto/posts.view-dto';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';


export function ApiCreatePostDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiBody({ type: CreatePostWithFilesDto }),
    ApiConsumes('multipart/form-data'),
    ApiOkResponse({
      type: PostViewDto,
      description: 'The post has been successfully created. The response body contains the post data',
    }),
    ApiBadRequestResponse({
      description: 'The inputModel has incorrect values',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Post not found', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden. User is banned' }),
  );
}
  