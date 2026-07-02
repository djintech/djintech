import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext) {
    const ctx = context.getArgByIndex(2);

    return {
      req: ctx?.req,
      res: ctx?.res,
    };
  }

  protected async getTracker(req: any): Promise<string> {
    return (
      req?.ip ||
      req?.headers?.['x-forwarded-for'] ||
      req?.connection?.remoteAddress ||
      'unknown'
    );
  }
}