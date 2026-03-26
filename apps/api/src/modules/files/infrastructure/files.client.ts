import { FILES_SERVICE, PATTERN_DELETE_FILES, PATTERN_UPLOAD_FILES } from '@libs/constants';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UploadFileRequest, UploadFileResponse } from '../../../../../../libs/contracts/files/upload-file.contract';
import { firstValueFrom } from 'rxjs';
import { DeleteAclResponse } from '@nestjs/microservices/external/kafka.interface';

@Injectable()
export class FilesClientService /*implements OnModuleInit*/ {
  constructor(
    @Inject(FILES_SERVICE) private readonly client: ClientProxy,
  ) {}

  // async onModuleInit() {
  //   await this.client.connect();
  // }

  async upload(files: UploadFileRequest[] ): Promise<UploadFileResponse[]> {
    return firstValueFrom(
      this.client.send( PATTERN_UPLOAD_FILES, files )
    );
  }

  delete(keys: string[]): Promise<DeleteAclResponse> {
    return firstValueFrom(
      this.client.send(PATTERN_DELETE_FILES, { keys }),
    );
  }
}
