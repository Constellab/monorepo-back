import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

/**
 * An OAuth 2.0 error response (RFC 6749 §5.2): `{ error, error_description }`.
 *
 * A dedicated exception type is required because a mounting application's global exception
 * filter rewrites every error body to its own shape, which would strip the OAuth `error`
 * code that clients parse — and that code is the only thing telling a client whether to
 * re-register, retry with a verifier, or give up.
 */
export class BlOAuthException extends HttpException {
  constructor(
    readonly error: string,
    readonly errorDescription: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    super({ error, error_description: errorDescription }, status);
  }
}

/**
 * Emits OAuth-shaped error bodies. Bound to the OAuth server controller with `@UseFilters`
 * so it takes precedence over the mounting application's global exception filter.
 */
@Catch(BlOAuthException)
export class BlOAuthExceptionFilter implements ExceptionFilter<BlOAuthException> {
  catch(exception: BlOAuthException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(exception.getStatus()).json({
      error: exception.error,
      error_description: exception.errorDescription,
    });
  }
}
