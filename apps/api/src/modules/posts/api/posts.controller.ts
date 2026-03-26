import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiOkResponse, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { CreatePostInputDto } from './input-dto/posts.input-dto';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UserId } from '@src/modules/user-accounts/guards/decorators/param/user-id.decorator';
import { CreatePostWithFilesDto } from './input-dto/posts-with-files.input-dto';
import { CustomFilesInterceptor } from '../interseptors/custom-files.interceptor';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('JwtAuth')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreatePostWithFilesDto })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: PostViewDto, description: 'The post has been successfully created. The response body contains the post data' })
  @ApiBadRequestResponse({ description: 'The inputModel has incorrect values', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  @UseInterceptors(CustomFilesInterceptor)
  async createPost(
    @UserId() userId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreatePostInputDto,
  ): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(new CreatePostCommand( dto, userId, files ));
    return this.queryBus.execute(new GetPostByIdQuery( postId ));
  }
}
