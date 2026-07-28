import { PaymentType, SubscriptionType } from './subscription';

export enum PaymentsSortBy {
  createdAt = 'createdAt',
  price = 'price',
  paymentType = 'paymentType',
}

export enum PaymentsSortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export class GetPaymentsRequest {
  pageNumber!: number;
  pageSize!: number;
  sortBy!: PaymentsSortBy;
  sortDirection!: PaymentsSortDirection;
  userIds?: number[];
  disablePagination?: boolean;
}

export class PaymentsViewModel {
  id!: number;
  userId!: number;
  createdAt!: string;
  amount!: number;
  paymentType!: PaymentType;
  subscriptionType!: SubscriptionType;
}

export class PaymentsWithPaginationViewModel {
  totalCount!: number;
  pagesCount!: number;
  page!: number;
  pageSize!: number;
  items!: PaymentsViewModel[];
}
