import { Controller, HttpCode, HttpStatus, Post, Req, Headers } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiExcludeController } from "@nestjs/swagger";
import { StripeWebhookResponse } from "@libs/contracts/payments/stripe-webhook";
import { StripeWebhookCommand } from "../application/usecases/stripe-webhook.use-case";

export interface RawBodyRequest extends Request {
  rawBody: Buffer;
}

@ApiExcludeController()
@Controller('webhooks')
export class StripeWebhooksController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest,
    @Headers('stripe-signature') signature: string,
  ): Promise<StripeWebhookResponse>  {
    const rawBody = req.rawBody;
    return this.commandBus.execute( new StripeWebhookCommand(signature, rawBody) );
  }
}
    