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
}
