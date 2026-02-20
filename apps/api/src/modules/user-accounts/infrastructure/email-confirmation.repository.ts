import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { EmailConfirmation, Prisma } from '@src/generated/prisma/client';

@Injectable()
export class EmailConfirmationRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    data: Prisma.EmailConfirmationCreateInput,
  ): Promise<EmailConfirmation> {
    return this.prisma.emailConfirmation.create({ data });
  }

  async update(
    id: number,
    data: Prisma.EmailConfirmationUpdateInput,
  ): Promise<EmailConfirmation> {
    return this.prisma.emailConfirmation.update({ where: { id }, data });
  }

  async updateByUserId(
    userId: number,
    data: Prisma.EmailConfirmationUpdateInput,
  ): Promise<EmailConfirmation> {
    return this.prisma.emailConfirmation.update({
      where: { userId },
      data,
    });
  }

  async findByUserId(userId: number): Promise<EmailConfirmation | null> {
    return this.prisma.emailConfirmation.findUnique({ where: { userId } });
  }

  async findUserByConfirmationCode(
    code: string,
  ): Promise<EmailConfirmation | null> {
    return this.prisma.emailConfirmation.findFirst({
      where: {
        confirmationCode: code,
        user: { deletedAt: null },
      },
    });
  }

  // async save(dto: Prisma.EmailConfirmationCreateInput & { id?: number }): Promise<EmailConfirmation> {
  //   const { id, ...data } = dto;
  //   if (id) {
  //     return this.prisma.emailConfirmation.update({
  //       where: { id },
  //       data,
  //     });
  //   } else {
  //     return this.prisma.emailConfirmation.create({ data });
  //   }
  // }

  // async updateEmailConfirmationCode( code: string, userId: number ): Promise<void> {
  //   const emailConfirmation = await this.findbyUserId( userId );
  //   if ( emailConfirmation ) {
  //     emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
  //     emailConfirmation.confirmationCode = code;
  //     await this.save( emailConfirmation );
  //     return;
  //   }
  //   throw new Error('Failed to update: no previos data in database');
  // }
}
