export const PAYMENT_BASE_PATH = '/settings';
export const PAYMENT_QUERY_PART = 'subscriptions';

export const PAYMENT_STATUS = {
  SUCCESS: 'success',
  CANCEL: 'cancel',
} as const;

export function buildPaymentUrl(baseUrl: string, status: string) {
  return `${baseUrl}${PAYMENT_BASE_PATH}?part=${PAYMENT_QUERY_PART}&status=${status}`;
}
