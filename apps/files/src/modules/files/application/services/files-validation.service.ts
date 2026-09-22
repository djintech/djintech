import { ALLOWED_AUDIO_MIME_TYPES, MESSENGER_VOICE_MAX_DURATION, MESSENGER_VOICE_SIZE, POST_IMAGE_SIZE, POST_MAX_IMAGES_COUNT, } from '@libs/constants';
import { UploadFileRequest, UploadType } from '@libs/contracts/files/upload-file.contract';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesValidationService {
  async validateFiles(files: UploadFileRequest[]) {
    if (!files?.length) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'At least one file is required',
        extensions: [
          {
            message: 'At least one file is required',
            field: 'file',
          },
        ],
      });
    }

    if (files.length > POST_MAX_IMAGES_COUNT) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Maximum ${POST_MAX_IMAGES_COUNT} images allowed`,
        extensions: [
          {
            message: `Maximum ${POST_MAX_IMAGES_COUNT} images allowed`,
            field: 'file',
          },
        ],
      });
    }

    for (const file of files) {
      const buffer = Buffer.from(file.buffer, 'base64');

      if (file.size !== buffer.length) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'File size does not match the actual file size',
          extensions: [
            {
              message: 'File size does not match the actual file size',
              field: 'file',
            },
          ],
        });
      }

      const detected = await this.detectFileType(buffer);

      if (!detected) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'Unable to detect file type',
          extensions: [
            {
              message: 'Unable to detect file type',
              field: 'file',
            },
          ],
        });
      }

      if (file.type === UploadType.VOICE) {
        await this.validateAudio(file, buffer, detected.mime);
        continue;
      }

      if (!file.mimeType.match(/^image\/(jpeg|png)$/)) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'Only JPG/PNG files are allowed',
          extensions: [
            {
              message: 'Only JPG/PNG files are allowed',
              field: 'file',
            },
          ],
        });
      }

      if (detected.mime !== file.mimeType) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'File MIME type does not match its actual content',
          extensions: [
            {
              message: 'File MIME type does not match its actual content',
              field: 'file',
            },
          ],
        });
      }

      if (file.size > POST_IMAGE_SIZE) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: `File size exceeds maximum of 20MB`,
          extensions: [
            {
              message: `File size exceeds maximum of 20MB`,
              field: 'file',
            },
          ],
        });
      }
    }
  }

  private async validateAudio(
    file: UploadFileRequest,
    buffer: Buffer,
    detectedMimeType: string,
  ) {
    if (!ALLOWED_AUDIO_MIME_TYPES.includes(detectedMimeType)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Unsupported audio format',
        extensions: [
          {
            message: 'Unsupported audio format',
            field: 'file',
          },
        ],
      });
    }

    if (detectedMimeType !== file.mimeType) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'File MIME type does not match its actual content',
        extensions: [
          {
            message: 'File MIME type does not match its actual content',
            field: 'file',
          },
        ],
      });
    }

    if (file.size > MESSENGER_VOICE_SIZE) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Audio file size exceeds maximum of ${MESSENGER_VOICE_SIZE / 1024 / 1024}MB`,
        extensions: [
          {
            message: `Audio file size exceeds maximum of ${MESSENGER_VOICE_SIZE / 1024 / 1024}MB`,
            field: 'file',
          },
        ],
      });
    }

    const metadata = await this.parseAudioMetadata(
      buffer,
      file.mimeType,
      file.originalName,
    );
    const duration = metadata.format.duration;

    if (!duration) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Unable to determine audio duration',
        extensions: [
          {
            message: 'Unable to determine audio duration',
            field: 'file',
          },
        ],
      });
    }

    if (duration > MESSENGER_VOICE_MAX_DURATION) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Audio duration must not exceed ${MESSENGER_VOICE_MAX_DURATION} seconds`,
        extensions: [
          {
            message: `Audio duration must not exceed ${MESSENGER_VOICE_MAX_DURATION} seconds`,
            field: 'file',
          },
        ],
      });
    }
  }

  private async detectFileType(buffer: Buffer) {
    const { fileTypeFromBuffer } = await import('file-type');

    return fileTypeFromBuffer(buffer);
  }

  private async parseAudioMetadata( buffer: Buffer, mimeType: string, originalName: string ) {
    const { parseBuffer } = await import('music-metadata');

    return parseBuffer(buffer, {
      mimeType,
      path: originalName,
    });
  }  
}