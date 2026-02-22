import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserAccountsConfig } from '../../config/user-accounts.config';
import { UserContextDto } from '../../dto/user-context.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(userAccountsConfig: UserAccountsConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: userAccountsConfig.accessTokenSecret,
    });
  }

  /**
   * функция принимает payload из jwt токена и возвращает то, что будет записано в req.user
   * @param payload
   */
  async validate(payload: { id: string }): Promise<UserContextDto> {
    //console.log('!!!!!!!!!!!!!!!!!payload ', payload.id);
    return {
      id: payload.id,
    };
  }
}
