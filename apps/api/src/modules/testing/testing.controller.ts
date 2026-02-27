import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../../db/prisma.service';
import { Prisma } from '../../generated/prisma/client';

@SkipThrottle()
@Controller('testing')
export class TestingController {
  constructor(private prisma: PrismaService) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.OK)
  async deleteAll() {
    if (
      process.env.NODE_ENV !== 'development' &&
      process.env.NODE_ENV !== 'testing'
    ) {
      throw new Error('Cannot truncate tables in non-dev/test environment');
    }

    const excluded = ['_prisma_migrations', 'policies'];

    const rawTables = await this.prisma.$queryRaw<
      Array<{ table_name: string }>
    >`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN (${Prisma.join(
          excluded.map((t) => Prisma.sql`${t}`),
        )})
    `;

    const tableNames = rawTables.map((t) => `"public"."${t.table_name}"`);

    if (tableNames.length > 0) {
      const tablesList = tableNames.join(', ');
      await this.prisma.$executeRawUnsafe(
        `TRUNCATE TABLE ${tablesList} RESTART IDENTITY CASCADE;`,
      );
    }

    return {
      status: 'succeeded',
      trunkatedTables: tableNames,
    };
  }
}
