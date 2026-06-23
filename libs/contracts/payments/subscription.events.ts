export class SubscriptionActivatedEvent {
  userId!: number;
  subscriptionId!: number;
  expireAt!: string | null; // ISO
}

export class SubscriptionExpiredEvent {
  userId!: number;
  subscriptionId!: number;
}

export class SubscriptionReminderEvent { 
  userId!: number; 
  expireAt!: string; 
  nextPaymentAt?: string; 
}
