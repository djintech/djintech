import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query.repository";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { FileUrlService } from "../../../../core/file/file-url.service";

export class GetPostByIdQuery {
  constructor(
    public id: number
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler
  implements IQueryHandler<GetPostByIdQuery, PostViewDto>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
        private readonly fileUrlService: FileUrlService
  ) {}

  async execute({ id }: GetPostByIdQuery) {
    const post = await this.postsQueryRepository.findPostById( id );

    if ( !post ){
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ message: 'Post not found', field: 'post' }],
      });      
    }

    const buildUrl = this.fileUrlService.getPublicUrl.bind(this.fileUrlService);
    return PostViewDto.mapToView( post, buildUrl );
}
}