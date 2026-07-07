import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AdminAuthService } from "../application/services/admin-auth.service";
import { LoginPayload } from "../dto/login.payload";
import { LoginInput } from "../dto/login.input";

@Resolver()
export class AdminAuthResolver {
  constructor(
    private adminAuthService: AdminAuthService,
  ) {}

  @Mutation(() => LoginPayload, {
    name: 'login',
  })  
  login(
    @Args('input') input: LoginInput,
  ) {
    return this.adminAuthService.login(
      input.email,
      input.password,
    );
  }
}
