import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentsClientService } from '@src/modules/payments/infrastructure/payments.client';
import { StripeEventType } from 'apps/payments/src/modules/subscriptions/constants/stripe.constants';

export class StripeWebhookCommand {
  constructor(
    public signature: string,
    public rawBody: Buffer,
  ) {}
}

@CommandHandler(StripeWebhookCommand)
export class StripeWebhookUseCase implements ICommandHandler<StripeWebhookCommand> {
  //private readonly logger = new Logger(StripeWebhookUseCase.name);

  constructor(
    private readonly paymentsClient: PaymentsClientService,
  ) {}

  async execute({ signature, rawBody }: StripeWebhookCommand) {
    try {
      await this.paymentsClient.handleStripeWebhook({ signature, rawBody: rawBody.toString('base64') });
    } catch (error: any) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Error in Stripe Webhook. ${error.message}`,
        extensions: [{ message: `Error in Stripe Webhook. ${error.message}`, field: 'Suscription'}],
      })
    }

    return { received: true };
  }
}
