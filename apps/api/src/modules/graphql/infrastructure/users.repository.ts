import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Prisma, User } from '@src/generated/prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }
}
