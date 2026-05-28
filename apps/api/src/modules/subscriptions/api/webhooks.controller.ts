import { Controller, HttpCode, HttpStatus, Post, Req, Headers } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { StripeWebhookResponse } from "@libs/contracts/payments/stripe-webhook";
import { PaymentsClientService } from "@src/modules/payments/infrastructure/payments.client";

export interface RawBodyRequest extends Request {
  rawBody: Buffer;
}

@ApiExcludeController()
@Controller('webhooks')
export class StripeWebhooksController {
  constructor(private readonly paymentsClient: PaymentsClientService,) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest,
    @Headers('stripe-signature') signature: string,
  ): Promise<StripeWebhookResponse>  {
    return this.paymentsClient.handleStripeWebhook({
      signature,
      rawBody: req.rawBody.toString('base64'),
    });    
  }
}
    