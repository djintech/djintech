import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetPaymentsRequest,
  PaymentsWithPaginationViewModel,
} from '@libs/contracts/payments/get-payments';
import { SubscriptionQueryRepository } from '../../infrastructure/query/subscription.query.repository';

export class GetPaymentsQuery {
  constructor(public readonly payload: GetPaymentsRequest) {}
}

@QueryHandler(GetPaymentsQuery)
export class GetPaymentsHandler
  implements IQueryHandler<GetPaymentsQuery, PaymentsWithPaginationViewModel>
{
  constructor(private readonly subscriptionQueryRepository: SubscriptionQueryRepository) {}

  execute({ payload }: GetPaymentsQuery): Promise<PaymentsWithPaginationViewModel> {
    return this.subscriptionQueryRepository.getPayments(payload);
  }
}
