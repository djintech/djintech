import { CreateSubscriptionResponse } from "@libs/contracts/payments/create-subscription";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PaymentsClientService } from "@src/modules/payments/infrastructure/payments.client";
import { CreateSubscriptionDto } from "../dto/create-subscription.dto";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { ProfilesRepository } from "@src/modules/user-accounts/profile/infrastructure/profiles.repository";
import { AccountType } from "@src/generated/prisma/enums";

export class CreateSubscriptionCommand {
  constructor(
    public readonly userId: number,
    public readonly dto: CreateSubscriptionDto,
  ) {}
}

@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionUseCase
  implements ICommandHandler<CreateSubscriptionCommand, CreateSubscriptionResponse>
{
  constructor( 
    private readonly paymentsClient: PaymentsClientService,
    private profilesRepository: ProfilesRepository,
  ) {}

  async execute({ userId, dto }: CreateSubscriptionCommand): Promise<CreateSubscriptionResponse> {
    const profile = await this.profilesRepository.findeByUserIdWithEmail( userId );

    if ( !profile ) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'profile not found',
        extensions: [{ message: 'profile not found', field: 'userId'}],
      })
    }
    
    try {
      const payload = {
        planId: dto.planId,
        userId,
        email: profile.user.email,
        paymentType: dto.paymentType
      }
      const subscriptionUrl = await this.paymentsClient.create(payload);
      await this.profilesRepository.update( userId, { accountType: AccountType.Business })

      return subscriptionUrl;

    } catch (error: any) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Suscription not created. ${error.message}`,
        extensions: [{ message: `Suscription not created. ${error.message}`, field: 'Suscription'}],
      })
    }
  }
}
 