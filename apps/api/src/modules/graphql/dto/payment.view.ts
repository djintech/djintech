import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PaymentType } from '@libs/contracts/payments/subscription';
import { SubscriptionType } from './subscription-type.enum';

registerEnumType(PaymentType, { name: 'PaymentType' });
registerEnumType(SubscriptionType, { name: 'SubscriptionType' });

@ObjectType()
export class PaymentView {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  userId!: number;

  @Field()
  userName!: string;

  @Field(() => String, { nullable: true })
  avatar!: string | null;

  @Field()
  createdAt!: Date;

  @Field(() => Int)
  amount!: number;

  @Field(() => PaymentType)
  paymentMethod!: PaymentType;

  @Field(() => SubscriptionType)
  subscriptionType!: SubscriptionType;
}
