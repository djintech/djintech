import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PaymentView } from './payment.view';

@ObjectType()
export class PaymentsPaginatedView {
  @Field(() => [PaymentView])
  items!: PaymentView[];

  @Field(() => Int)
  totalCount!: number;

  @Field(() => Int)
  pagesCount!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;
}
