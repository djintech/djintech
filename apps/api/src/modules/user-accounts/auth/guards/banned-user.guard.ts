import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { CanActivate, ExecutionContext, Injectable, } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';

@Injectable()
export class BannedUserGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const rawUserId = request.user?.id;

    const userId = typeof rawUserId === 'string' ? Number(rawUserId) : rawUserId;

     if (!userId || Number.isNaN(userId)) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'User information is missing',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isBanned: true,
      },
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'User not found',
      });
    }

    if (user.isBanned) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'User is banned',
      });
    }

    return true;
  }
}
