import { PATTERN_CREATE_SUBSCRIPTION, PAYMENTS_SERVICE} from '@libs/constants';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentsClientService {
  constructor(
    @Inject(PAYMENTS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async create() {
    return firstValueFrom(
      this.client.send( PATTERN_CREATE_SUBSCRIPTION, {} )
    );
  }

  // delete(keys: string[]): Promise<DeletedFileResponse> {
  //   return firstValueFrom(
  //     this.client.send(PATTERN_DELETE_FILES, { keys }),
  //   );
  // }
}
