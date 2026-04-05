import { Injectable } from "@nestjs/common";
import { PrismaService } from "@src/db/prisma.service";
import { Avatar } from "@src/generated/prisma/client";

@Injectable()
export class AvatarsQueryRepository {
  constructor(private prisma: PrismaService) {}

  async findyId( id: number ): Promise<Avatar | null> {
    return this.prisma.avatar.findUnique({ where: { id, deletedAt: null }})
  }
}