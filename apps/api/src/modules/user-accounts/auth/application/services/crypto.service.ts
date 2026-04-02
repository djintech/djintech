import bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { CoreConfig } from '@src/core/config/core.config';

@Injectable()
export class CryptoService {
  private readonly costFactor: number;

  constructor(private readonly coreConfig: CoreConfig) {
    this.costFactor = this.coreConfig.costFactor;
  }

  async createPasswordHash(password: string): Promise<string> {
    return bcrypt.hash(password, this.costFactor);
  }

  async comparePasswords(args: {
    password: string;
    hash: string;
  }): Promise<boolean> {
    return bcrypt.compare(args.password, args.hash);
  }
}
