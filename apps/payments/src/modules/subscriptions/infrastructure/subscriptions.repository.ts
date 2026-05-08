import { Injectable } from "@nestjs/common";
import { PrismaService } from "apps/payments/src/db/prisma.service";
import { Prisma, Subscription } from "apps/payments/src/generated/prisma/client";

@Injectable()
export class SubscriptionsRepository {
  constructor(private prisma: PrismaService) {}

  async create( data: Prisma.SubscriptionCreateInput): Promise<Subscription> {
    return this.prisma.subscription.create({ data });
  }

  async update(id: number, data: Prisma.SubscriptionUpdateInput): Promise<Subscription> {
    return this.prisma.subscription.update({ where: { id }, data });
  }

  async findByUserId( userId: number ): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({ where: { userId }});
  }

  async findByExternalId(externalId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({ where: { externalId }});
  }

  async findByProviderSubscriptionId(providerSubscriptionId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({ where: { providerSubscriptionId }});
  }

  async findByCustomerId(customerId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({ where: { customerId } });
  }

  async findActiveOrPendingByUserId(userId: number) {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'PENDING'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}