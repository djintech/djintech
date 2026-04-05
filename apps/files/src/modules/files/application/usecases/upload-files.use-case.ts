import { UploadFileRequest, UploadFileResponse, UploadType } from "@libs/contracts/files/upload-file.contract";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { S3Service } from "../services/s3.service";
import { UuidService } from "@libs/utils/src/uuid/uuid.service";
import { FilesValidationService } from "../services/files-validation.service";


export class UploadFilesCommand {
  constructor(public readonly dto: UploadFileRequest[]) {}
}

@CommandHandler(UploadFilesCommand)
export class UploadFilesCommandHandler implements ICommandHandler<UploadFilesCommand> {
  constructor(
    private readonly s3: S3Service,
    private readonly uuidService: UuidService,
    private readonly filesValidation: FilesValidationService,
  ) {}

  async execute({ dto }: UploadFilesCommand): Promise<UploadFileResponse[]> {
    this.filesValidation.validateFiles(dto);

    return Promise.all(
      dto.map(async file => {
        const { buffer: base64Buffer, mimeType, size } = file;
        const buffer = Buffer.from( base64Buffer, 'base64' );
        const key = this.buildKey(file); 
        
        await this.s3.upload({ buffer, key, contentType: mimeType });

        return { key, mimeType, size };
      }),
    );
  }

  private buildKey(file: UploadFileRequest): string {
    const type = file.type ?? UploadType.BASE;

    if (type === UploadType.AVATAR) {
      if (!file.userId) throw new Error('userId is required for avatar');
      return `avatars/${file.userId}`;
    }

    return `${this.uuidService.generate()}-${file.originalName}`;
  }
}
