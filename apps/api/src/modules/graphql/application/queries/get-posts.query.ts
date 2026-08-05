import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostsInput } from '../../dto/get-posts.input';
import { PostsPaginatedView } from '../../dto/posts-paginated.view';
import { PostFullInfo, PostsQueryRepository } from '../../infrastructure/queries/posts.query.repository';
import { ImagePostView, PostView } from '../../dto/post.view';
import { FileUrlService } from '@src/core/file/file-url.service';

export class GetPostsQuery {
  constructor(public readonly input: GetPostsInput) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler
  implements IQueryHandler<GetPostsQuery, PostsPaginatedView>
{
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async execute({ input }: GetPostsQuery): Promise<PostsPaginatedView> {
    const { endCursorPostId, searchTerm, pageSize, sortDirection, sortBy } = input;

    const { posts, totalCount } = await this.postsQueryRepository.getAll({ sortDirection, endCursorPostId, pageSize, searchTerm, sortBy});
    
    return {
      items: posts.map((post) =>
        this.mapPost(post, this.fileUrlService),
      ),
      totalCount,
      pagesCount: Math.ceil(totalCount / pageSize),
      pageSize,
    };
  }
  

  private mapPost( post: PostFullInfo, fileUrlService: FileUrlService ): PostView {
    return {
      id: post.id,
      ownerId: post.userId,
      description: post.description ?? '',
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,

      userBan:
        post.user.isBanned &&
        post.user.banReason &&
        post.user.banDate
          ? {
              reason: post.user.banReason,
              createdAt: post.user.banDate,
            }
          : null,

      postOwner: {
        id: post.user.id,
        userName: post.user.username,
        avatar: post.user.profile?.avatar?.key
          ? fileUrlService.getPublicUrl(post.user.profile.avatar.key)
          : null,
      },

      images: post.postImages
        .sort((a, b) => a.position - b.position)
        .map<ImagePostView>((image) => ({
          position: image.position,
          url: fileUrlService.getPublicUrl(image.key),
        })),
    };
  }
}
