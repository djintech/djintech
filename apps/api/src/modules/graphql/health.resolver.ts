import { Query, Resolver } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';

@Resolver()
@SkipThrottle()
export class HealthResolver {
  @Query(() => String)
  health(): string {
    return 'ok';
  }
}
