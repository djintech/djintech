import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';

@Injectable()
export class MessageQueryRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findById(id: number) {
    return this.prisma.message.findUnique({
      where: { id },
    });
  }
}
