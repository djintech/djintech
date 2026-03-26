// libs/core/exceptions/filters/domain-rpc-exceptions.filter.ts
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { DomainException } from '../domain-exceptions';
import { Observable, throwError } from 'rxjs';

@Catch(DomainException)
export class DomainRpcExceptionsFilter implements RpcExceptionFilter<DomainException> {
  catch(exception: DomainException, host: ArgumentsHost): Observable<any> {
    return throwError(
      () =>
        new RpcException({
          code: exception.code,
          message: exception.message,
          extensions: exception.extensions,
        }),
    );
  }
}
