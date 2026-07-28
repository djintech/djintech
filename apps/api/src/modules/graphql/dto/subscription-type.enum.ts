import { registerEnumType } from '@nestjs/graphql';
import { SubscriptionType } from '@libs/contracts/payments/subscription';

registerEnumType(SubscriptionType, {
  name: 'SubscriptionType',
});

export { SubscriptionType };