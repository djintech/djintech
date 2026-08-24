import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FileUrlService } from "../../../../core/file/file-url.service";
import { BaseQueryParams, SortDirection } from "@src/core/dto/base.query-params.input-dto";
import { PaginatedViewDto } from "@src/core/dto/base.paginated.view-dto";
import { MAIN_PAGE_SIZE } from "../../constants";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { CommentsQueryRepository } from "../../infrastructure/query/comments.query.repository";
import { AnswerViewDto } from "../../api/view-dto/answer.view-dto";

export class GetAnswersQuery {
  constructor(
    public query: BaseQueryParams,
    public readonly userId: number,
    public readonly postId: number,
    public readonly commentId: number,
  ) {}
}

@QueryHandler(GetAnswersQuery)
export class GetAnswersQueryHandler
  implements IQueryHandler<GetAnswersQuery, PaginatedViewDto<AnswerViewDto[]> >
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private readonly fileUrlService: FileUrlService
  ) {}

  async execute({ query, userId, postId, commentId }: GetAnswersQuery): Promise<PaginatedViewDto<AnswerViewDto[]>> {
    const comment = await this.commentsQueryRepository.findCommentByIdAndPostId(commentId, postId);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    const { pageNumber, pageSize, sortDirection } = query;
    const pageSizeValue = pageSize ?? MAIN_PAGE_SIZE;
    const order = sortDirection === SortDirection.Asc ? SortDirection.Asc : SortDirection.Desc;

    const {answers, totalCount} = await this.commentsQueryRepository.getAllAnswers({ 
      order,
      skip: query.calculateSkip(),
      pageSize: pageSizeValue,
      postId,
      parentId: commentId,
      userId
    });

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      size: pageSizeValue,
      totalCount,
      items: answers.map( answer => AnswerViewDto.mapToView(answer, this.fileUrlService.getPublicUrl.bind(this.fileUrlService)) ),
    });
}
}