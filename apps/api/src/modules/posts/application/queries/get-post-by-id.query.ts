import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query.repository";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { FilesConfig } from "@src/config/files/files.config";

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
    private readonly config: FilesConfig,
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

    const url = `https://${this.config.awsS3Bucket}.s3.${this.config.awsRegion}.amazonaws.com/public/`;

    return PostViewDto.mapToView( post, url );
}
}