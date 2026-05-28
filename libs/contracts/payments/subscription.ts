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
  WEEKLY: 'price_1TPrGaEDDgrGHqntSazUmAS1',
  DAY: 'price_1TPrGqEDDgrGHqntjSCGEG2g',
};