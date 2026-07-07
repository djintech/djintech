import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AdminAuthService } from "../application/services/admin-auth.service";
import { LoginPayload } from "../dto/login.payload";
import { LoginInput } from "../dto/login.input";
import { SkipThrottle } from "@nestjs/throttler";

@Resolver()
export class AdminAuthResolver {
  constructor(
    private adminAuthService: AdminAuthService,
  ) {}

  @Mutation(() => LoginPayload, {
    name: 'login',
  })  
  @SkipThrottle()
  login(
    @Args('input') input: LoginInput,
  ) {
    return this.adminAuthService.login(
      input.email,
      input.password,
    );
  }
}
