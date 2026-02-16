import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateUserInputDto } from "./input-dto/users.input-dto";
import { RegisterUserCommand } from "../application/usecases/users/register-user.usecase";
import { RegistrationConfirmationInputDto } from "./input-dto/registration-confirmation.input-dto";
import { RegistrationEmailResendingInputDto } from "./input-dto/registration-email-resending.input-dto";
import { RegistrationConfirmationCommand } from "../application/usecases/users/registration-confirmation.usecase";
import { RegistrationEmailResendingCommand } from "../application/usecases/users/registration-email-resending.usecase";

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('registration')
  //@SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('registration-confirmation')
  //@SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationConfirmation(@Body() body: RegistrationConfirmationInputDto): Promise<void> {
    return this.commandBus.execute(new RegistrationConfirmationCommand( body ));
  }

  @Post('registration-email-resending')
  //@SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationEmailResending(@Body() body: RegistrationEmailResendingInputDto): Promise<void> {
    return this.commandBus.execute(new RegistrationEmailResendingCommand( body ));
  }

}
