import { registerEnumType } from '@nestjs/graphql';

export enum PaymentsSortBy {
  USERNAME = 'username',
  CREATED_AT = 'createdAt',
  AMOUNT = 'amount',
  PAYMENT_METHOD = 'paymentMethod',
}

registerEnumType(PaymentsSortBy, {
  name: 'PaymentsSortBy',
});
