import { Module } from '@nestjs/common';
import { PolicyController } from '@src/modules/privacy/api/policies.controller';
import { PoliciesQueryRepository } from '@src/modules/privacy/infrastructure/policies.query.repository';

@Module({
  imports: [],
  controllers: [PolicyController],
  providers: [PoliciesQueryRepository],
  exports: [],
})
export class PoliciesModule {}
