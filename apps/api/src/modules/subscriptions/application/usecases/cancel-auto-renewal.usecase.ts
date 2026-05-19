import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PaymentsClientService } from '@src/modules/payments/infrastructure/payments.client';
import { ProfilesRepository } from '@src/modules/user-accounts/profile/infrastructure/profiles.repository';
import { AccountType } from '@src/generated/prisma/enums';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';

export class CancelAutoRenewalCommand {
  constructor(public readonly userId: number) {}
}

@Injectable()
@CommandHandler(CancelAutoRenewalCommand)
export class CancelAutoRenewalUseCase
  implements ICommandHandler<CancelAutoRenewalCommand>
{
  constructor(
    private readonly paymentsClientService: PaymentsClientService,
    private profilesRepository: ProfilesRepository,
  ) {}

  async execute({ userId }: CancelAutoRenewalCommand): Promise<void> {
    const profile = await this.profilesRepository.findeByUserIdWithEmail( userId );
    
    if ( !profile ) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'profile not found',
        extensions: [{ message: 'profile not found', field: 'userId'}],
      })
    }

    try {
      const isCanseledAutoRenewal = await this.paymentsClientService.cancelAutoRenewal({ userId });

      if ( isCanseledAutoRenewal ) {
        await this.profilesRepository.update( userId, { accountType: AccountType.Personal })
      }
    } catch (error: any) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Error to update subscription autorenewal. ${error.message}`,
        extensions: [{ message: `Error to update subscription autorenewal. ${error.message}`, field: 'Suscription'}],
      })
    }
  }
}
