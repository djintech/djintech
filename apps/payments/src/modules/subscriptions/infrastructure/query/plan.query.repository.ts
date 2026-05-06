import { Injectable } from "@nestjs/common";
import { PrismaService } from "apps/payments/src/db/prisma.service";
import { Plan } from "apps/payments/src/generated/prisma/client";

@Injectable()
export class PlanQueryRepository {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Plan[]> {
    return this.prisma.plan.findMany();
  }

  async getById( id: number ): Promise<Plan | null> {
    return this.prisma.plan.findUnique({ where: { id }});
  }
}