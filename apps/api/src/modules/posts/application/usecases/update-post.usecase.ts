import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { UpdatePostDto } from "../dto/update-post.dto";

export class UpdatePostCommand {
  constructor(
    public userId: number,
    public postId: number,
    public readonly dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostCommand, void>
{
  constructor( private postsRepository: PostsRepository ){
  }

  async execute({ userId, postId, dto }: UpdatePostCommand): Promise<void> {
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

    const description = dto.description ?? null;
    await this.postsRepository.update( postId, { description });
    return;
  }
}