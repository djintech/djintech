import { Catch } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import { DomainException } from '../domain-exceptions';

@Catch(DomainException)
export class DomainGraphqlExceptionsFilter
  implements GqlExceptionFilter
{
  catch(exception: DomainException) {
    return new GraphQLError(exception.message, {
      extensions: {
        code: exception.code,
        errorsMessages: exception.extensions,
      },
    });
  }
}
