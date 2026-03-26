import { POST_IMAGE_SIZE, POST_MAX_IMAGES_COUNT } from '@libs/constants';
import { UploadFileRequest } from '@libs/contracts/files/upload-file.contract';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesValidationService {
  validateFiles(files: UploadFileRequest[]) {
    if (!files?.length) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'At least one file is required',
        extensions: [{ message: 'At least one file is required', field: 'file'}],
      });
    }

    if (files.length > POST_MAX_IMAGES_COUNT) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Maximum ${POST_MAX_IMAGES_COUNT} images allowed`,
        extensions: [{ message: `Maximum ${POST_MAX_IMAGES_COUNT} images allowed`, field: 'file'}],
      });
    }

    files.forEach(file => {
      const { mimeType, size } = file;

      if (!mimeType.match(/\/(jpg|jpeg|png)$/)) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'Only JPG/PNG files are allowed',
          extensions: [{ message: `Only JPG/PNG files are allowed`, field: 'file'}],
        });
      }

      if (size > POST_IMAGE_SIZE) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: `File size exceeds maximum of 20MB`,
          extensions: [{ message: `File size exceeds maximum of 20MB`, field: 'file'}],
        });
      }
    });
  }
}
