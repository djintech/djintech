export interface PaymentProvider {
  createSession(params: {
    customerId: string;
    priceId: string;
  }): Promise<{
    id: string;
    url: string;
  }>;

  createCustomer(email: string): Promise<{
    id: string;
  }>;

  cancelAutoRenewal(subscriptionId: string): Promise<any>;

  renewAutoRenewal(subscriptionId: string): Promise<any>;
}
