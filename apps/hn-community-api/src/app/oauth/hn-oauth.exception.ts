import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

/**
 * An OAuth 2.0 error response (RFC 6749 §5.2): `{ error, error_description }`.
 *
 * A dedicated exception type is required because the global
 * `HnCoreExceptionHandlerFilter` rewrites every error body to the Constellab
 * `BlApiError` shape, which would strip the OAuth error code that clients parse.
 */
export class HnOAuthException extends HttpException {
  constructor(
    readonly error: string,
    readonly errorDescription: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    super({ error, error_description: errorDescription }, status);
  }
}

/**
 * Emits OAuth-shaped error bodies. Bound to the OAuth controller with
 * `@UseFilters` so it takes precedence over the global exception filter.
 */
@Catch(HnOAuthException)
export class HnOAuthExceptionFilter implements ExceptionFilter<HnOAuthException> {
  catch(exception: HnOAuthException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(exception.getStatus()).json({
      error: exception.error,
      error_description: exception.errorDescription,
    });
  }
}
