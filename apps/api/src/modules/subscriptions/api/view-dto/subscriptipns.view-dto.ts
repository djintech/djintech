import { ApiProperty } from "@nestjs/swagger";

export class SubscriptionsViewDto {
  @ApiProperty()
    url!: string;
}