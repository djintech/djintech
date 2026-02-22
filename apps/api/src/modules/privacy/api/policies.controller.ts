import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { PoliciesQueryRepository } from '@src/modules/privacy/infrastructure/policies.query.repository';

@Controller('privacy')
export class PolicyController {
  constructor(
    private readonly policyQueryRepository: PoliciesQueryRepository,
  ) {}

  @ApiOkResponse({ description: 'success' })
  @ApiNotFoundResponse({ description: 'terms of service not found' })
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

  @ApiOkResponse({ description: 'success' })
  @ApiNotFoundResponse({ description: 'policy not found' })
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
