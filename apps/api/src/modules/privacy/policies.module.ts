import { Module } from '@nestjs/common';
import { PolicyController } from '@modules/privacy/api/policies.controller';
import { PoliciesQueryRepository } from '@modules/privacy/infrastructure/policies.query.repository';

@Module({
  imports: [],
  controllers: [PolicyController],
  providers: [PoliciesQueryRepository],
  exports: [],
})
export class PoliciesModule {}
