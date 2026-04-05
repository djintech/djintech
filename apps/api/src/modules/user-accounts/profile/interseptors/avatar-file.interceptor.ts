import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AVATAR_IMAGE_SIZE } from '@libs/constants';
import multer from 'multer';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import sharp from 'sharp';

@Injectable()
export class AvatarFileInterceptor implements NestInterceptor {
  private uploader;

  constructor() {
    this.uploader = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: AVATAR_IMAGE_SIZE,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new DomainException({
              code: DomainExceptionCode.BadRequest,
              message: 'wrong file',
              extensions: [
                { message: 'wrong file type', field: 'file' },
              ],
            }) as any,
            false,
          );
        }
        cb(null, true);
      },
    }).single('file');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    return new Observable((observer) => {
      this.uploader(request, request.res, (err: any) => {
        if (err) {
          // 🔥 ВСЕ ошибки ловим тут
          if (err instanceof DomainException) {
            return observer.error(err);
          }

          // MulterError → преобразуем
          if (err instanceof multer.MulterError) {
            let message = 'Upload error';

            switch (err.code) {
              case 'LIMIT_FILE_SIZE':
                message = 'File too large';
                break;
              case 'LIMIT_FILE_COUNT':
                message = 'Too many files';
                break;
              case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected file';
                break;
            }

            return observer.error(
              new DomainException({
                code: DomainExceptionCode.BadRequest,
                message,
                extensions: [{ message, field: 'file' }],
              }),
            );
          }

          // неизвестная ошибка
          return observer.error(
            new DomainException({
              code: DomainExceptionCode.InternalServerError,
              message: 'Unknown upload error',
              extensions: [],
            }),
          );
        }

        if (!request.file) {
          return observer.error(
            new DomainException({
              code: DomainExceptionCode.BadRequest,
              message: 'File is required',
              extensions: [{ message: 'File is required', field: 'file' }],
            }),
          );
        }

        // ресайз через sharp
        (async () => {
          try {
            const buffer = await sharp(request.file.buffer)
              .resize(340, 340)
              .toBuffer();

            request.file.buffer = buffer;
            request.file.mimetype = request.file.mimetype;

            next.handle().subscribe({
              next: v => observer.next(v),
              error: e => observer.error(e),
              complete: () => observer.complete(),
            });
          } catch (error) {
            observer.error(new DomainException({
              code: DomainExceptionCode.InternalServerError,
              message: 'Image processing failed ' + error,
            }));
          }
        })();
      });
    });
  }
}
