import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { S3Service } from './application/services/s3.service';
import { S3Config } from './config/s3.config';
import { FilesValidationService } from './application/services/files-validation.service';
import { FilesService } from '../../files.service';
import { UploadFilesCommandHandler } from './application/usecases/upload-files.use-case';
import { DeleteFilesCommandHandler } from './application/usecases/delete-files.use-case';
import { FilesController } from './api/files.controller';


const commands = [
  UploadFilesCommandHandler, 
  DeleteFilesCommandHandler
];

@Module({
  imports: [CqrsModule],
  controllers: [ FilesController ],
  providers: [...commands, S3Service, S3Config, FilesValidationService, FilesService],
  exports: [],
})
export class FilesModule {}
