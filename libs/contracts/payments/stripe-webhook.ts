import { IsNotEmpty, IsString } from "class-validator";

  export class StripeWebhookRequest {
    @IsString()
    @IsNotEmpty()
    signature!: string;

    @IsNotEmpty()
    rawBody!: string;
}
  
  export class StripeWebhookResponse {
    received!: boolean;
  }
    