import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";

export class DeletePostCommand {
  constructor(
    public postId: number,
    public userId: number
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, void>
{
  constructor( private postsRepository: PostsRepository ){
  }

  async execute({ postId, userId }: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findById( postId );

    if ( !post ){
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ message: 'Post not found', field: 'post' }],
      });      
    }

    if ( post.userId !== userId ){
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden. The user is not the owner of the post.'
      });      
    }
    
    await this.postsRepository.softDelete(postId);
    return;
  }
}