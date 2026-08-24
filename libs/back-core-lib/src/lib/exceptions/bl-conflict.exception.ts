import { HttpStatus } from '@nestjs/common';

import { BlExceptionOptions, BlHttpException } from './bl-http.exception';

/**
 * Basic Conflict Exception that support translation
 *
 * For a request that is well formed but fights the current state of the resource — an optimistic
 * lock whose revision is stale, for instance. The caller fixes it by reading the resource again,
 * not by fixing the request, which is what separates it from a BadRequest.
 */
export class BlConflictException extends BlHttpException {
  /**
   * Basic Conflict Exception that support translation
   * @param message the message will be translated if possible
   * @param options
   */
  constructor(message: string, options: BlExceptionOptions = {}) {
    super(HttpStatus.CONFLICT, message, options);
  }
}
