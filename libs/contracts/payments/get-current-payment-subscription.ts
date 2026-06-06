export class GetCurrentPaymentSubscriptionRequest {
  userId!: number;
}

export class GetCurrentPaymentSubscriptionResponse {
  subscriptionId!: number;
  expireAt!: string | null;
  autoRenewal!: boolean;
  planId!: number;
}
