import { PATTERN_CREATE_SUBSCRIPTION, PATTERN_GET_PLANS, PAYMENTS_SERVICE} from '@libs/constants';
import { CreateSubscriptionRequest, CreateSubscriptionResponse } from '@libs/contracts/payments/create-subscription';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class PaymentsClientService {
  constructor(
    @Inject(PAYMENTS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async create( payload: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    return firstValueFrom(
      this.client.send( PATTERN_CREATE_SUBSCRIPTION, payload ).pipe(timeout(5000))
    );
  }

  async getPlans() {
    return firstValueFrom(
      this.client.send( PATTERN_GET_PLANS, {} )
    );
  }

}
