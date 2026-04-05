import { UploadFileResponse, UploadType } from "@libs/contracts/files/upload-file.contract";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { FilesClientService } from "@src/modules/files/infrastructure/files.client";
import { AvatarsRepository } from "../../infrastructure/avatars.repository";
import { ProfilesRepository } from "../../infrastructure/profiles.repository";

export class CreateAvatarCommand {
  constructor(
    public readonly userId: number,
    public readonly file: Express.Multer.File,
  ) {}
}

@CommandHandler(CreateAvatarCommand)
export class CreateAvatarUseCase
  implements ICommandHandler<CreateAvatarCommand, number>
{
  constructor( 
    private avatarsRepository: AvatarsRepository,
    private profilesRepository: ProfilesRepository,
    private readonly filesClient: FilesClientService,
  ) {}

  async execute({ userId, file }: CreateAvatarCommand): Promise<number> {
    const profile = await this.profilesRepository.findeByUserId( userId );

    if ( !profile ) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'No profile for this user',
        extensions: [{ message: 'No profile for this user', field: 'profile'}],
      })
    }

    const payload = [{
      buffer: file.buffer.toString('base64'),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      type: UploadType.AVATAR,
      userId,
    }];

    let uploadedImage: UploadFileResponse[] = [];

    try {
      uploadedImage = await this.filesClient.upload(payload);
      const avatar = await this.avatarsRepository.upsert( profile.id, uploadedImage[0] );
      return avatar.id;
    } catch (error: any) {
      if ( uploadedImage.length ) {
        await this.filesClient.delete(uploadedImage.map(i => i.key));
      }

      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Avatar not created. ${error.message}`,
        extensions: [{ message: `Avatar not created. ${error.message}`, field: 'file'}],
      })
    }
  }
}
 