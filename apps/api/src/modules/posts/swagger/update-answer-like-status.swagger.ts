import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { UpdateCommentLikeStatusInputDto } from '../api/input-dto/update-comment-like-status.input-dto';

export function ApiUpdateAnswerLikeStatusDocs() {
  return applyDecorators(
    ApiSecurity('JwtAuth'),
    ApiOperation({ summary: 'Update answer like status' }),
    
    ApiBody({ type: UpdateCommentLikeStatusInputDto }),
    ApiParam({ name: 'postId', type: String, description: 'id of the post', example: '123', required: true }),
    ApiParam({ name: 'commentId', type: String, description: 'id of the comment', example: '123', required: true }),
    ApiParam({ name: 'answerId', type: String, description: 'id of the answer', example: '123', required: true }),
    
    ApiNoContentResponse({ description: 'The answer like status has been successfully updated' }),
    ApiNotFoundResponse({ description: 'Post not found', type: ErrorResponseDto }),
    ApiBadRequestResponse({ description: 'The inputModel has incorrect values', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized'}),
    ApiForbiddenResponse({ description: 'Forbidden. User is banned' }),
  );
}
