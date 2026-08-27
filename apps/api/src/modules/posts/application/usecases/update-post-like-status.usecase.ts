import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { UpdatePostLikeStatusInputDto } from "../../api/input-dto/update-post-like-status.input-dto";
import { PostLikesRepository } from "../../infrastructure/post-likes.repository";

export class UpdatePostLikeStatusCommand {
  constructor(
    public userId: number,
    public postId: number,
    public readonly dto: UpdatePostLikeStatusInputDto,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand, void>
{
  constructor( 
    private postsRepository: PostsRepository,
    private postLikesRepository: PostLikesRepository,
  ){
  }

  async execute({ userId, postId, dto }: UpdatePostLikeStatusCommand): Promise<void> {
    const post = await this.postsRepository.findById( postId );

    if ( !post ){
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ message: 'Post not found', field: 'post' }],
      });      
    }

    await this.postLikesRepository.upsert(postId, userId, dto.likeStatus );
    return;
  }
}