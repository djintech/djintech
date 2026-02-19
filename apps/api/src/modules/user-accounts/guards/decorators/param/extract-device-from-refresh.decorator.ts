import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request as ExpressRequest } from 'express';
import { RefreshTokenPayloadType } from '@modules/user-accounts/application/dto/refresh-token-payload.type';

interface RequestWithCookies extends ExpressRequest {
  cookies: Record<string, string>;
}
export const ExtractDeviceFromRefresh = createParamDecorator(
  (jwtService: JwtService, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithCookies>();
    const token = request.cookies?.['refreshToken'];
    if (!token) return null;
    return jwtService.verify<RefreshTokenPayloadType>(token);
  },
);
