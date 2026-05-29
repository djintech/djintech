import {
  GetMyPaymentsRequest,
  PaymentsWithPaginationViewModel,
} from '@libs/contracts/payments/get-my-payments';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SubscriptionQueryRepository } from '../../infrastructure/query/subscription.query.repository';

export class GetMyPaymentsQuery {
  constructor(public readonly payload: GetMyPaymentsRequest) {}
}

@QueryHandler(GetMyPaymentsQuery)
export class GetMyPaymentsHandler
  implements IQueryHandler<GetMyPaymentsQuery, PaymentsWithPaginationViewModel>
{
  constructor(
    private readonly subscriptionQueryRepository: SubscriptionQueryRepository,
  ) {}

  async execute({ payload }: GetMyPaymentsQuery): Promise<PaymentsWithPaginationViewModel> {
    return this.subscriptionQueryRepository.getMyPayments(payload);
  }
}
