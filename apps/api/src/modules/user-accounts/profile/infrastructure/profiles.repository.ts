import { Injectable } from "@nestjs/common";
import { PrismaService } from "@src/db/prisma.service";
import { Prisma, Profile } from "@src/generated/prisma/client";
import { CreateUserDto } from "../application/dto/create-profile.dto";

@Injectable()
export class ProfilesRepository {
  constructor(private prisma: PrismaService) {}

  async findeByUserId(userId: number): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { userId }, });
  }

  async updateTx(tx: Prisma.TransactionClient, userId: number, data: Prisma.ProfileUpdateInput ) {
    return tx.profile.update({
      where: { userId },
      data: { ...data,
        deletedAt: null,
      }
    });
  }
}