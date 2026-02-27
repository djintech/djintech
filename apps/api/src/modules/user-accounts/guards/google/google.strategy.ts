// google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { GoogleOAuthConfig } from '../../config/google-oauth.config';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor( private readonly googleConfig: GoogleOAuthConfig ) {
    super({
      clientID: googleConfig.googleClientId,
      clientSecret: googleConfig.googleClientSecret,
      callbackURL: googleConfig.googleCallbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate( accessToken: string, refreshToken: string, profile: Profile ) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
         extensions: [{ message: 'No Email from google', field: 'email'}]
      });
    }
    
    if (!profile._json.email_verified) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
         extensions: [{ message: 'Email not verified by google', field: 'email'}]
      });
    }
    return {
      providerEmail: email,
      providerId: profile.id,
      providerName: profile.displayName,
    };
  }
}