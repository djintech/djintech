import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { POST_IMAGE_SIZE, POST_MAX_IMAGES_COUNT } from '@libs/constants';
import multer from 'multer';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';

@Injectable()
export class CustomFilesInterceptor implements NestInterceptor {
  private uploader;

  constructor() {
    this.uploader = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: POST_IMAGE_SIZE,
        files: POST_MAX_IMAGES_COUNT,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new DomainException({
              code: DomainExceptionCode.BadRequest,
              message: 'wrong file',
              extensions: [
                { message: 'wrong file type', field: 'files' },
              ],
            }) as any,
            false,
          );
        }
        cb(null, true);
      },
    }).array('files', POST_MAX_IMAGES_COUNT);
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
                extensions: [{ message, field: 'files' }],
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

        // 👉 multer положит файлы сюда
        request.files = request.files || [];

        next.handle().subscribe({
          next: (value) => observer.next(value),
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
      });
    });
  }
}