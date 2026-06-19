export enum SubscriptionType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum PaymentType {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

export const STRIPE_PRICE_MAP = {
  MONTHLY: 'price_1TPrFvEDDgrGHqntCn1PTVWZ',
  WEEKLY: 'price_1Tk4MJEDDgrGHqntENCLM2K5',
  DAY: 'price_1Tk4L4EDDgrGHqnt86q5gTHc',
};