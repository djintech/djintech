import { Injectable } from '@nestjs/common';
import { CreateEmailConfirmationDto } from '../dto/create-email-confirmation.dto';
import { Prisma } from '@src/generated/prisma/client';

@Injectable()
export class EmailConfirmationFactory {
  constructor() {}

  create(dto: CreateEmailConfirmationDto): Prisma.EmailConfirmationCreateInput {
    return {
      user: { connect: { id: dto.userId } },
      isConfirmed: dto.isEmailConfirmed ?? false,
      expirationDate: dto.expirationDate,
      confirmationCode: dto.confirmationCode,
    };
  }
}
