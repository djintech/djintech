import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { CreatePostDto } from "../dto/create-post.dto";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { FilesClientService } from "@src/modules/files/infrastructure/files.client";
import { UploadFileResponse } from "@libs/contracts/files/upload-file.contract";


export class CreatePostCommand {
  constructor(
    public readonly dto: CreatePostDto,
    public readonly userId: number,
    public readonly files: Express.Multer.File[],
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, number>
{
  constructor( 
    private postsRepository: PostsRepository,
    private readonly filesClient: FilesClientService,
  ) {}

  async execute({ dto, userId, files }: CreatePostCommand): Promise<number> {
    if (!files || files.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'The post must contain at least one file',
        extensions: [{ message: 'The post must contain at least one file', field: 'images'}],
      })
    }

    const payload = files.map(file => ({
      buffer: file.buffer.toString('base64'),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    }));

    let uploadedImages: UploadFileResponse[] = [];

    try {
      uploadedImages = await this.filesClient.upload(payload);
      const post = await this.postsRepository.createPostWithImages( userId, dto.description, uploadedImages);
      return post.id;
    } catch (error) {
      if (uploadedImages.length) {
        await this.filesClient.delete(uploadedImages.map((i) => i.key));
      }

      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Post not created. ${error.message}`,
        extensions: [{ message: `Post not created. ${error.message}`, field: 'files'}],
      })
    }
  }
}
 