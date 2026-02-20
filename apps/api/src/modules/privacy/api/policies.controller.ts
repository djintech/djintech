import { Controller, Get, NotFoundException } from '@nestjs/common';
import { PoliciesQueryRepository } from '@modules/privacy/infrastructure/policies.query.repository';

@Controller('privacy')
export class PolicyController {
  constructor(
    private readonly policyQueryRepository: PoliciesQueryRepository,
  ) {}

  @Get('terms-of-service')
  async getTermsOfService() {
    const policy = await this.policyQueryRepository.getLatestTermsOfService();

    if (!policy) throw new NotFoundException();

    return {
      content: policy.content,
      version: policy.version,
      updatedAt: policy.updatedAt,
    };
  }

  @Get('privacy-policy')
  async getPrivacyPolicy() {
    const policy = await this.policyQueryRepository.getLatestPrivacyPolicy();

    if (!policy) throw new NotFoundException();

    return {
      content: policy.content,
      version: policy.version,
      updatedAt: policy.updatedAt,
    };
  }
}
