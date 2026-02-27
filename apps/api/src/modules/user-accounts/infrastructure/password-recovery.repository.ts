import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { PasswordRecovery, Prisma } from '@src/generated/prisma/client';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.PasswordRecoveryCreateInput): Promise<PasswordRecovery> {
    return this.prisma.passwordRecovery.create({ data });
  }

  async update(
      id: number,
      data: Prisma.PasswordRecoveryUpdateInput,
    ): Promise<PasswordRecovery> {
      return this.prisma.passwordRecovery.update({ where: { id }, data });
    }

  async findByRecoveryCode( code: string ): Promise<PasswordRecovery | null> {
    return this.prisma.passwordRecovery.findFirst({
      where: {
        recoveryCode: code,
        user: { deletedAt: null },
      },
    });
  }

   async findByUserId(userId: number): Promise<PasswordRecovery | null> {
      return this.prisma.passwordRecovery.findFirst({
        where: { userId },
      });
    }
  
}
