import Stripe from 'stripe';
import { StripeAdapter } from '../../src/modules/subscriptions/application/stripe.adapter';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        id: 'evt_test_123',
      }),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
        list: jest.fn(),
      },
    },
    subscriptions: {
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    customers: {
      create: jest.fn(),
    },
    invoices: {
      list: jest.fn(),
    },
  }));
});

describe('StripeAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('constructWebhookEvent should call stripe.webhooks.constructEvent with config secret', () => {
    const adapter = new StripeAdapter({
      stripeSecretKey: 'sk_test_123',
      stripeWebhookSecret: 'whsec_test_123',
    } as any);

    const event = adapter.constructWebhookEvent(
      Buffer.from('{"id":"evt_test_123"}'),
      'stripe_signature',
    );

    const stripeClient = (Stripe as unknown as jest.Mock).mock.results[0].value;

    expect(stripeClient.webhooks.constructEvent).toHaveBeenCalledWith(
      Buffer.from('{"id":"evt_test_123"}'),
      'stripe_signature',
      'whsec_test_123',
    );
    expect(event).toEqual({ id: 'evt_test_123' });
  });
});
