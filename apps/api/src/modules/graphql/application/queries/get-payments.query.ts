import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FileUrlService } from '@src/core/file/file-url.service';
import { GetPaymentsInput } from '../../dto/get-payments.input';
import { PaymentsPaginatedView } from '../../dto/payments-paginated.view';
import { PaymentsSortBy as GraphqlPaymentsSortBy } from '../../dto/payments-sort-by.enum';
import { PaymentsClientService } from '@src/modules/payments/infrastructure/payments.client';
import { PaymentView } from '../../dto/payment.view';
import { PaymentsSortDirection, PaymentsSortBy as ContractPaymentsSortBy, } from '@libs/contracts/payments/get-payments';
import { UsersQueryRepository } from '../../infrastructure/queries/users.query.repository';
import { SortDirection } from '../../dto/sort-direction.enum';
import { SubscriptionType } from '../../dto/subscription-type.enum';

export class GetPaymentsQuery {
  constructor(public readonly input: GetPaymentsInput) {}
}

@QueryHandler(GetPaymentsQuery)
export class GetPaymentsQueryHandler
  implements IQueryHandler<GetPaymentsQuery, PaymentsPaginatedView>
{
  constructor(
    private readonly paymentsClient: PaymentsClientService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async execute({ input }: GetPaymentsQuery): Promise<PaymentsPaginatedView> {
    const { pageNumber, pageSize, searchTerm, sortDirection, sortBy } = input;
    
    let userIds: number[] | undefined;

    if (searchTerm?.trim()) {
      const users = await this.usersQueryRepository.getUsersShort({ searchTerm: searchTerm.trim() });
      
      if (users.length === 0) {
        return {
          items: [],
          totalCount: 0,
          pagesCount: 0,
          page: pageNumber,
          pageSize,
        };
      }

      userIds = users.map((user) => user.id);
    }

    const paymentsPage = await this.paymentsClient.getPayments({
      pageNumber,
      pageSize,
      sortBy: this.mapSortBy(sortBy),
      sortDirection:
        sortDirection === SortDirection.Asc
          ? PaymentsSortDirection.Asc
          : PaymentsSortDirection.Desc,
      userIds,
      disablePagination: sortBy === GraphqlPaymentsSortBy.USERNAME,
    });

    const pageUserIds = [...new Set(paymentsPage.items.map((i) => i.userId))];

    const users =
      pageUserIds.length === 0
        ? []
        : await this.usersQueryRepository.getUsersShort({ ids: pageUserIds });

    const usersMap = new Map(
      users.map((user) => [
        user.id,
        {
          username: user.username,
          avatar: user.profile?.avatar?.key
            ? this.fileUrlService.getPublicUrl(user.profile.avatar.key)
            : null,
        },
      ]),
    );

    if (sortBy === GraphqlPaymentsSortBy.USERNAME) {
      paymentsPage.items.sort((a, b) => {
        const userA = usersMap.get(a.userId)?.username ?? '';
        const userB = usersMap.get(b.userId)?.username ?? '';

        return sortDirection === SortDirection.Asc
          ? userA.localeCompare(userB, undefined, { sensitivity: 'base' })
          : userB.localeCompare(userA, undefined, { sensitivity: 'base' });
      });

      const start = (pageNumber - 1) * pageSize;

      paymentsPage.items = paymentsPage.items.slice(start, start + pageSize);
    }

      const items: PaymentView[] = paymentsPage.items.map((item) => {
        const user = usersMap.get(item.userId);
        return {
          id: item.id,
          userId: item.userId,
          userName: user?.username ?? '',
          avatar: user?.avatar ?? null,
          createdAt: new Date(item.createdAt),
          amount: item.amount,
          paymentMethod: item.paymentType,
          subscriptionType: this.mapSubscriptionType(item.subscriptionType),
        };
      });

    return {
      items,
      totalCount: paymentsPage.totalCount,
      pagesCount: paymentsPage.pagesCount,
      page: pageNumber,
      pageSize,
    };
  }

  private mapSortBy(sortBy: GraphqlPaymentsSortBy): ContractPaymentsSortBy {
    switch (sortBy) {
      case GraphqlPaymentsSortBy.AMOUNT:
        return ContractPaymentsSortBy.price;
      case GraphqlPaymentsSortBy.PAYMENT_METHOD:
        return ContractPaymentsSortBy.paymentType;
      case GraphqlPaymentsSortBy.CREATED_AT:
      default:
        return ContractPaymentsSortBy.createdAt;
    }
  }
  
  private mapSubscriptionType(type: string): SubscriptionType {
    if (type === 'DAY') {
      return SubscriptionType.DAILY;
    }

    return type as SubscriptionType;
  }
}
