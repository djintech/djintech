import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Prisma, User } from '@src/generated/prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [{ username }, { email }],
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email },
    });
  }

  async updatePasswordHash( passwordHash: string, id: number ): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash }
    });
  }

  // async save(user: Prisma.UserCreateInput & { id?: number }): Promise<User> {
  //   if (user.id) {
  //     const { id, ...data } = user;
  //     return this.prisma.user.update({
  //       where: { id },
  //       data,
  //     });
  //   } else {
  //     return this.prisma.user.create({
  //       data: user,
  //     });
  //   }
  // }

  // async softDelete(id: number): Promise<void> {
  //   await this.user.softDelete( id );
  //   return ;
  // }

  // async findById(id: number): Promise<User | null> {
  //   return this.user.findOneBy({ id }); //не включает soft-deleted записи, если не указать withDeleted: true
  // }

  // async findOrNotFoundFail(id: number): Promise<User> {
  //   const result = await this.findById(id);

  //   if ( !result ) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: 'not fouund',
  //     });
  //   }

  //   return result;
  // }

  // async findByEmail( email: string ): Promise<User | null> {
  //   return this.user.findOneBy({ email })
  // }


}
