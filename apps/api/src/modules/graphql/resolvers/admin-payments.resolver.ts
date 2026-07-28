import { UseFilters, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { DomainGraphqlExceptionsFilter } from '@libs/core/exceptions/filters/domain-graphql-exceptions.filter';
import { GqlAuthGuard } from '../guards/gql-super-admin.guard';
import { GetPaymentsInput } from '../dto/get-payments.input';
import { GetPaymentsQuery } from '../application/queries/get-payments.query';
import { PaymentsPaginatedView } from '../dto/payments-paginated.view';

@Resolver()
@SkipThrottle()
@UseFilters(DomainGraphqlExceptionsFilter)
export class AdminPaymentsResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => PaymentsPaginatedView, { name: 'getPayments' })
  @UseGuards(GqlAuthGuard)
  async getPayments(
    @Args('input', { type: () => GetPaymentsInput }) input: GetPaymentsInput,
  ): Promise<PaymentsPaginatedView> {
    return this.queryBus.execute(new GetPaymentsQuery(input));
  }
}
