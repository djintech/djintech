import { PaymentType, SubscriptionType } from './subscription';

export enum PaymentsSortBy {
  createdAt = 'createdAt',
  paymentType = 'paymentType',
  price = 'price',
  expireAt = 'expireAt',
  startAt = 'startAt',
}

export enum PaymentsSortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export class GetMyPaymentsRequest {
  userId!: number;
  pageNumber!: number;
  pageSize!: number;
  sortBy!: PaymentsSortBy;
  sortDirection!: PaymentsSortDirection;
}

export class PaymentsViewModel {
  userId!: number;
  subscriptionId!: number;
  startAt!: string | null;
  expireAt!: string | null;
  price!: number;
  subscriptionType!: SubscriptionType;
  paymentType!: PaymentType;
}

export class PaymentsWithPaginationViewModel {
  totalCount!: number;
  pagesCount!: number;
  page!: number;
  pageSize!: number;
  items!: PaymentsViewModel[];
}
