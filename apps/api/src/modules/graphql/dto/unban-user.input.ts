import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

@InputType()
export class UnbanUserInput {
  @Field(() => Int)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId!: number;
}
