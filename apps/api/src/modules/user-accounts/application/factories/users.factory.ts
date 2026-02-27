import { Injectable } from '@nestjs/common';
import { CryptoService } from '../services/crypto.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Prisma } from '@src/generated/prisma/client';

@Injectable()
export class UsersFactory {
  constructor(private readonly cryptoService: CryptoService) {}

  async create(dto: CreateUserDto): Promise<Prisma.UserCreateInput> {
    const passwordHash = dto.password ? await this.cryptoService.createPasswordHash(
      dto.password,
    ) : null;
  
    return {
      email: dto.email,
      username: dto.username,
      passwordHash,
      isConfirmed: dto.isConfirmed ?? false,
    };
  }

  async update(dto: CreateUserDto): Promise<Prisma.UserUpdateInput> {
    const passwordHash = dto.password ? await this.cryptoService.createPasswordHash(
      dto.password,
    ) : null;

    return {
      email: dto.email,
      username: dto.username,
      passwordHash,
    };
  }
}
