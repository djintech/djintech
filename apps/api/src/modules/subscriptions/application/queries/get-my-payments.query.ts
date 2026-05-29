import {
  PaymentsSortBy as ContractPaymentsSortBy,
  PaymentsSortBy,
  PaymentsSortDirection,
  PaymentsWithPaginationViewModel,
} from '@libs/contracts/payments/get-my-payments';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SortDirection } from '@src/core/dto/base.query-params.input-dto';
import { PaymentsClientService } from '@src/modules/payments/infrastructure/payments.client';
import { ProfilesRepository } from '@src/modules/user-accounts/profile/infrastructure/profiles.repository';
import {
  GetMyPaymentsQueryParams,
} from '../../api/input-dto/get-my-payments.input-dto';

export class GetMyPaymentsQuery {
  constructor(
    public readonly userId: number,
    public readonly query: GetMyPaymentsQueryParams,
  ) {}
}

@QueryHandler(GetMyPaymentsQuery)
export class GetMyPaymentsHandler
  implements IQueryHandler<GetMyPaymentsQuery, PaymentsWithPaginationViewModel>
{
  constructor(
    private readonly paymentsClient: PaymentsClientService,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async execute({
    userId,
    query,
  }: GetMyPaymentsQuery): Promise<PaymentsWithPaginationViewModel> {
    const profile = await this.profilesRepository.findeByUserId(userId);

    if (!profile) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'profile not found',
        extensions: [{ message: 'profile not found', field: 'userId' }],
      });
    }

    return this.paymentsClient.getMyPayments({
      userId,
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      sortBy: (query.sortBy ?? PaymentsSortBy.createdAt) as ContractPaymentsSortBy,
      sortDirection:
        query.sortDirection === SortDirection.Asc
          ? PaymentsSortDirection.Asc
          : PaymentsSortDirection.Desc,
    });
  }
}
