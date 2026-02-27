import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Prisma, ProviderType, UserProvider } from '@src/generated/prisma/client';

@Injectable()
export class UserProvidersRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserProviderCreateInput): Promise<UserProvider> {
    return this.prisma.userProvider.create({ data });
  }

  async update(id: number, data: Prisma.UserProviderUpdateInput): Promise<UserProvider> {
    return this.prisma.userProvider.update({ where: { id }, data });
  }

  async findByProviderId( provider: ProviderType, providerId: string): Promise<UserProvider | null> {
    return this.prisma.userProvider.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    });
  }
}
