import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

@InputType()
export class BanUserInput {
  @Field(() => Int)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId!: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  banReason!: string;
}
