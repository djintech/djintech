import { PATTERN_CANCEL_AUTO_RENEWAL_SUBSCRIPTION, PATTERN_CREATE_SUBSCRIPTION, PATTERN_GET_PLANS, PATTERN_RENEW_AUTO_RENEWAL_SUBSCRIPTION, PAYMENTS_SERVICE} from '@libs/constants';
import { CancelAutoRenewalRequest, CancelAutoRenewalResponse } from '@libs/contracts/payments/cancel-auto-renewal';
import { CreateSubscriptionRequest, CreateSubscriptionResponse } from '@libs/contracts/payments/create-subscription';
import { RenewAutoRenewalRequest, RenewAutoRenewalResponse } from '@libs/contracts/payments/renew-auto-renewal';
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

  async cancelAutoRenewal( payload: CancelAutoRenewalRequest ): Promise<CancelAutoRenewalResponse> {
    return firstValueFrom(
      this.client
        .send(PATTERN_CANCEL_AUTO_RENEWAL_SUBSCRIPTION, payload)
        .pipe(timeout(5000)),
    );
  }

  async renewAutoRenewal( payload: RenewAutoRenewalRequest ): Promise<RenewAutoRenewalResponse> {
    return firstValueFrom(
      this.client
        .send(PATTERN_RENEW_AUTO_RENEWAL_SUBSCRIPTION, payload)
        .pipe(timeout(5000)),
    );
  }

  async getPlans() {
    return firstValueFrom(
      this.client.send( PATTERN_GET_PLANS, {} )
    );
  }

}
