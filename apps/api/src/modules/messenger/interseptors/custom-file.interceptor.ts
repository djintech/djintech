import { CallHandler, ExecutionContext, Injectable, NestInterceptor, } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MESSENGER_IMAGE_SIZE } from '@libs/constants';
import multer from 'multer';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';

@Injectable()
export class CustomFileInterceptor implements NestInterceptor {
  private uploader;

  constructor() {
    this.uploader = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: MESSENGER_IMAGE_SIZE,
        files: 1,
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
                message = 'File size must not exceed 1 MB';
                break;

              case 'LIMIT_FILE_COUNT':
                message = 'Only one file is allowed';
                break;

              case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected file field';
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

        // 👉 multer положит файлы сюда
        request.file = request.file || null;

        next.handle().subscribe({
          next: (value) => observer.next(value),
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
      });
    });
  }
}
