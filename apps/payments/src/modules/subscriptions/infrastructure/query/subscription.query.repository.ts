import {
  GetMyPaymentsRequest,
  PaymentsSortBy,
  PaymentsSortDirection,
  PaymentsViewModel,
  PaymentsWithPaginationViewModel,
} from '@libs/contracts/payments/get-my-payments';
import {
  GetPaymentsRequest,
  PaymentsWithPaginationViewModel as AdminPaymentsWithPaginationViewModel,
  PaymentsViewModel as AdminPaymentsViewModel,
  PaymentsSortBy as PaymentsSortByContract,
  PaymentsSortDirection as PaymentsSortDirectionContract,
} from '@libs/contracts/payments/get-payments';
import {
  PaymentType,
  SubscriptionType,
} from '@libs/contracts/payments/subscription';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/payments/src/db/prisma.service';
import { Prisma, Subscription, SubscriptionStatus } from 'apps/payments/src/generated/prisma/client';

@Injectable()
export class SubscriptionQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMyCurrent(userId: number): Promise< Subscription | null> { 
    return this.prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE, deletedAt: null }, 
      orderBy: {
        expireAt: 'desc',
      }
    });
  }

  async getPayments(payload: GetPaymentsRequest): Promise<AdminPaymentsWithPaginationViewModel> {
    const where: Prisma.SubscriptionWhereInput = {
      deletedAt: null,
    };

    if (payload.userIds && payload.userIds.length > 0) {
      where.userId = { in: payload.userIds };
    }

    const orderBy = this.buildPaymentsOrderBy(payload.sortBy, payload.sortDirection);

    const [subscriptions, totalCount] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        ...(payload.disablePagination
          ? {}
          : {
              skip: (payload.pageNumber - 1) * payload.pageSize,
              take: payload.pageSize,
            }),
        orderBy,
        include: { plan: true },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      totalCount,
      pagesCount: Math.ceil(totalCount / payload.pageSize),
      page: payload.pageNumber,
      pageSize: payload.pageSize,
      items: subscriptions.map(
        (subscription): AdminPaymentsViewModel => ({
          id: subscription.id,
          userId: subscription.userId,
          createdAt: subscription.createdAt.toISOString(),
          amount: subscription.plan.price,
          paymentType: subscription.paymentType as PaymentType,
          subscriptionType: subscription.plan.subscriptionType as SubscriptionType,
        }),
      ),
    };
  }
  
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

  private buildPaymentsOrderBy(
    sortBy: PaymentsSortByContract,
    sortDirection: PaymentsSortDirectionContract,
  ): Prisma.SubscriptionOrderByWithRelationInput {
    switch (sortBy) {
      case PaymentsSortByContract.price:
        return { plan: { price: sortDirection } };
      case PaymentsSortByContract.paymentType:
        return { paymentType: sortDirection };
      case PaymentsSortByContract.createdAt:
      default:
        return { createdAt: sortDirection };
    }
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
