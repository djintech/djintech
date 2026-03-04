import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { CreatePostDto } from "../dto/create-post.dto";


export class CreatePostCommand {
  constructor(
    public dto: CreatePostDto,
    public userId: number
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, number>
{
  constructor( private postsRepository: PostsRepository ) {}

  async execute({ dto, userId }: CreatePostCommand): Promise<number> {
    const post = await this.postsRepository.create({ 
      user: { connect: { id: userId } },
      description: dto.description
    });

    return post.id;
  }
}