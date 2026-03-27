import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query.repository";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { FileUrlService } from "../../infrastructure/services/file-url.service";

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
        code: DomainExceptionCode.BadRequest,
        message: 'No post found',
        extensions: [{ message: 'No post found', field: 'post' }],
      });      
    }

    return PostViewDto.mapToView( post, this.fileUrlService.getPublicUrl );
}
}