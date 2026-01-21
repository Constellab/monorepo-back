import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export const BL_TIMEOUT_KEY = 'bl_timeout';

@Injectable()
export class BlTimeoutInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private defaultTimeout: number = 30000
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutValue =
      this.reflector.get<number>(BL_TIMEOUT_KEY, context.getHandler()) ?? this.defaultTimeout;

    return next.handle().pipe(
      timeout(timeoutValue),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () => new RequestTimeoutException('The request took too long and has been timed out.')
          );
        }
        return throwError(() => err);
      })
    );
  }
}
