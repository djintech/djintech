import { PAYMENTS_SERVICE} from '@libs/constants';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsClientService {
  constructor(
    @Inject(PAYMENTS_SERVICE) private readonly client: ClientProxy,
  ) {}

  // async onModuleInit() {
  //   await this.client.connect();
  // }

  // async upload(files: UploadFileRequest[] ): Promise<UploadFileResponse[]> {
  //   return firstValueFrom(
  //     this.client.send( PATTERN_UPLOAD_FILES, files )
  //   );
  // }

  // delete(keys: string[]): Promise<DeletedFileResponse> {
  //   return firstValueFrom(
  //     this.client.send(PATTERN_DELETE_FILES, { keys }),
  //   );
  // }
}
