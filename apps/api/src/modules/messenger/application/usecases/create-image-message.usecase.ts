import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MessageRepository } from '../../infrastructure/message.repository';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { FilesClientService } from '@src/modules/files/infrastructure/files.client';
import { FileUrlService } from '@src/core/file/file-url.service';
import { MessageViewDto } from '../../api/view-dto/message.view-dto';
import { MessageMediaType, MessageType } from '@src/generated/prisma/enums';
import { UsersRepository } from '../../infrastructure/users.repository';

export class CreateImageMessageCommand {
  constructor(
    public readonly messageText: string | undefined,
    public readonly ownerId: number,
    public readonly receiverId: number,
    public readonly file: Express.Multer.File | undefined,
  ) {}
}

@CommandHandler(CreateImageMessageCommand)
export class CreateImageMessageUseCase
  implements ICommandHandler<CreateImageMessageCommand, MessageViewDto>
{
  constructor(
    private readonly messageRepository: MessageRepository,
  private readonly usersRepository: UsersRepository,
    private readonly filesClient: FilesClientService,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async execute({ messageText, ownerId, receiverId, file }: CreateImageMessageCommand): Promise<MessageViewDto> {
    if (!file) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'The message must contain a file',
        extensions: [{ message: 'The message must contain a file', field: 'file'}],
      })
    }

    if (ownerId === receiverId) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Cannot send message to yourself',
        extensions: [
          {
            message: 'Cannot send message to yourself',
            field: 'receiverId',
          },
        ],
      });
    }

    const receiver = await this.usersRepository.findUnique(receiverId);

    if (!receiver) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Receiver not found',
        extensions: [
          {
            message: 'Receiver not found',
            field: 'receiverId',
          },
        ],
      });
    }

    const normalizedMessageText = messageText?.trim() || null;

    let uploadedFileKey: string | null = null;

    try {
      const uploadedFiles = await this.filesClient.upload([
        {
          buffer: file.buffer.toString('base64'),
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      ]);

      const uploadedFile = uploadedFiles[0];

      if (!uploadedFile) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'File upload failed',
          extensions: [{ message: 'File upload failed', field: 'file' }],
        });
      }

      uploadedFileKey = uploadedFile.key;

      const message = await this.messageRepository.createMessageWithMedia({
        ownerId,
        receiverId,
        messageText: normalizedMessageText,

        messageType: MessageType.IMAGE,
        fileType: MessageMediaType.IMAGE,

        key: uploadedFile.key,
        mimeType: uploadedFile.mimeType,
        size: uploadedFile.size,
      });

      return MessageViewDto.mapToView( message, this.fileUrlService );
    } catch (error) {
      if (uploadedFileKey) {
        try {
          await this.filesClient.delete([ uploadedFileKey ]);
        } catch {
          //Здесь желательно добавить Logger.
        }
      }

      if (error instanceof DomainException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Message not created. ${errorMessage}`,
        extensions: [{ message: `Message not created. ${errorMessage}`, field: 'file' }],
      });
    }
  }
}
