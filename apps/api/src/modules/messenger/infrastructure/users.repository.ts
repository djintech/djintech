import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findUnique(id: number): Promise<{id: number} | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });
  }

}
