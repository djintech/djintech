import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { PolicyType } from '@src/generated/prisma/enums';

@Injectable()
export class PoliciesQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getLatestTermsOfService() {
    return this.prisma.policies.findFirst({
      where: { type: PolicyType.tos },
      orderBy: { version: 'desc' },
    });
  }

  async getLatestPrivacyPolicy() {
    return this.prisma.policies.findFirst({
      where: { type: PolicyType.privacy },
      orderBy: { version: 'desc' },
    });
  }
}
