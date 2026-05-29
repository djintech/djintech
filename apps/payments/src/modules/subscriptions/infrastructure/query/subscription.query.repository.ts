import {
  GetMyPaymentsRequest,
  PaymentsSortBy,
  PaymentsSortDirection,
  PaymentsViewModel,
  PaymentsWithPaginationViewModel,
} from '@libs/contracts/payments/get-my-payments';
import {
  PaymentType,
  SubscriptionType,
} from '@libs/contracts/payments/subscription';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/payments/src/db/prisma.service';
import { Prisma } from 'apps/payments/src/generated/prisma/client';

@Injectable()
export class SubscriptionQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMyPayments(
    payload: GetMyPaymentsRequest,
  ): Promise<PaymentsWithPaginationViewModel> {
    const page = payload.pageNumber;
    const pageSize = payload.pageSize;
    const where: Prisma.SubscriptionWhereInput = { userId: payload.userId };
    const orderBy = this.buildOrderBy(payload.sortBy, payload.sortDirection);

    const [subscriptions, totalCount] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        include: { plan: true },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      totalCount,
      pagesCount: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
      items: subscriptions.map(
        (subscription): PaymentsViewModel => ({
          userId: subscription.userId,
          subscriptionId: subscription.id,
          startAt: subscription.startAt?.toISOString() ?? null,
          expireAt: subscription.expireAt?.toISOString() ?? null,
          price: subscription.plan.price,
          subscriptionType: subscription.plan.subscriptionType as SubscriptionType,
          paymentType: subscription.paymentType as PaymentType,
        }),
      ),
    };
  }

  private buildOrderBy(
    sortBy: PaymentsSortBy,
    sortDirection: PaymentsSortDirection,
  ): Prisma.SubscriptionOrderByWithRelationInput {
    switch (sortBy) {
      case PaymentsSortBy.price:
        return { plan: { price: sortDirection } };
      case PaymentsSortBy.paymentType:
        return { paymentType: sortDirection };
      case PaymentsSortBy.expireAt:
        return { expireAt: sortDirection };
      case PaymentsSortBy.startAt:
        return { startAt: sortDirection };
      case PaymentsSortBy.createdAt:
      default:
        return { createdAt: sortDirection };
    }
  }
}
