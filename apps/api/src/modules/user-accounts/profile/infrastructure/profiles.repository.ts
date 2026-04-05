import { Injectable } from "@nestjs/common";
import { PrismaService } from "@src/db/prisma.service";
import { Profile } from "@src/generated/prisma/client";

@Injectable()
export class ProfilesRepository {
  constructor(private prisma: PrismaService) {}

  async findeByUserId(userId: number): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { userId }, });
  }
}